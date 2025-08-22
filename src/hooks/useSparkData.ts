import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';

export interface Grade {
  name: string;
  score: number;
  rank: number;
  level: 'LKG' | 'UKG' | '1' | '2' | '3' | '4';
  section: 'A' | 'B' | 'C' | 'D' | 'E';
  fullName: string; // e.g., "LKG-A", "1-B", etc.
}

export interface Winner {
  grade: 'LKG' | 'UKG' | '1' | '2' | '3' | '4';
  section: 'A' | 'B' | 'C' | 'D' | 'E';
  gradeSection: string; // e.g., "LKG-A", "1-B", etc.
  position: number;
  studentName: string;
  studentClass: string;
  points: number;
  image?: string;
}

export interface Event {
  id: string;
  name: string;
  category: string;
  type: 'Individual' | 'Group';
  description?: string;
  time?: string;
  venue?: string;
  winners?: Winner[];
  hasResults?: boolean;
  position?: number;
  grade?: string;
  section?: string;
  date?: string;
}

// Define grade sections in frontend
const GRADE_SECTIONS: { level: 'LKG' | 'UKG' | '1' | '2' | '3' | '4', sections: ('A' | 'B' | 'C' | 'D' | 'E')[] }[] = [
  { level: 'LKG', sections: ['A', 'B', 'C', 'D', 'E'] },
  { level: 'UKG', sections: ['A', 'B', 'C', 'D', 'E'] },
  { level: '1', sections: ['A', 'B', 'C', 'D', 'E'] },
  { level: '2', sections: ['A', 'B', 'C', 'D', 'E'] },
  { level: '3', sections: ['A', 'B', 'C', 'D', 'E'] },
  { level: '4', sections: ['A', 'B', 'C', 'D'] },
];

// Generate all grade-section combinations
const GRADE_LIST: Omit<Grade, 'score' | 'rank'>[] = GRADE_SECTIONS.flatMap(({ level, sections }) =>
  sections.map(section => ({
    name: `${level}-${section}`,
    level,
    section,
    fullName: `${level}-${section}`
  }))
);

export const useSparkData = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch and listen to Firestore collections (events only)
  useEffect(() => {
    setLoading(true);
    // Events (unified)
    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
      setEvents(data);
    });
    // Winners (legacy - can be removed later)
    const unsubWinners = onSnapshot(collection(db, 'winners'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWinners(data);
    });
    setLoading(false);
    return () => {
      unsubEvents();
      unsubWinners();
    };
  }, []);

  // Calculate points based on position and type
  const calculatePoints = (position: number, type: 'Individual' | 'Group'): number => {
    const individualScoring = { 1: 10, 2: 7, 3: 5, 4: 3, 5: 2, 6: 1 };
    const groupScoring = { 1: 20, 2: 14, 3: 10, 4: 6 };
    if (type === 'Individual') {
      return individualScoring[position as keyof typeof individualScoring] || 0;
    } else {
      return groupScoring[position as keyof typeof groupScoring] || 0;
    }
  };

  // Add new event (for admin)
  const addEvent = useCallback(async (eventData: Omit<Event, 'id'>) => {
    try {
      await addDoc(collection(db, 'events'), eventData);
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }, []);

  // Add event template (creates event without winners)
  const addEventTemplate = useCallback(async (templateData: any) => {
    try {
      const eventData = {
        ...templateData,
        winners: [],
        hasResults: false
      };
      await addDoc(collection(db, 'events'), eventData);
    } catch (error) {
      console.error('Error adding event template:', error);
      throw error;
    }
  }, []);

  // Add winners to existing event
  const addWinnersToEvent = useCallback(async (eventId: string, winners: Winner[]) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        winners: winners,
        hasResults: true
      });
    } catch (error) {
      console.error('Error adding winners to event:', error);
      throw error;
    }
  }, []);

  // Add winner photo (legacy function - can be updated later)
  const addWinnerPhoto = useCallback(async (winnerId: string, imageUrl: string) => {
    try {
      await updateDoc(doc(db, 'winners', winnerId), { image: imageUrl });
    } catch (error) {
      console.error('Error adding winner photo:', error);
      throw error;
    }
  }, []);

  // Calculate grade scores and ranks from events with results
  const grades: Grade[] = GRADE_LIST.map(grade => {
    const score = events
      .filter(event => event.hasResults && event.winners)
      .flatMap(event => event.winners || [])
      .filter(winner => winner.gradeSection === grade.fullName)
      .reduce((sum, winner) => sum + (winner.points || 0), 0);
    return { ...grade, score, rank: 0 };
  });
  
  // Sort by score (highest first)
  grades.sort((a, b) => b.score - a.score);
  
  // Assign ranks with proper tie handling (no rank skipping)
  let currentRank = 1;
  grades.forEach((grade, idx) => {
    if (grade.score === 0) {
      // Don't assign ranks to grades with zero points
      grade.rank = 0;
    } else if (idx === 0) {
      // First grade with points gets rank 1
      grade.rank = currentRank;
    } else if (grade.score < grades[idx - 1].score) {
      // Score is lower than previous, increment rank by 1 (no skipping)
      currentRank++;
      grade.rank = currentRank;
    } else {
      // Same score as previous, keep same rank
      grade.rank = currentRank;
    }
  });

  // Group grades by level for category champions
  const gradesByLevel = GRADE_SECTIONS.map(({ level }) => {
    const levelGrades = grades.filter(grade => grade.level === level);
    // Only set champion if someone has scored points
    const champion = levelGrades.length > 0 && levelGrades[0].score > 0 ? levelGrades[0] : null;
    return {
      level,
      grades: levelGrades,
      champion
    };
  });

  return {
    events,
    winners,
    grades,
    gradesByLevel,
    loading,
    addEvent,
    addEventTemplate,
    addWinnersToEvent,
    addWinnerPhoto,
    calculatePoints,
    GRADE_SECTIONS,
    GRADE_LIST,
  };
};