import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';

export interface House {
  name: string;
  score: number;
  rank: number;
  color: 'tagore' | 'delany' | 'gandhi' | 'nehru';
}

export interface Winner {
  house: string;
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
}

// Define houses in frontend
const HOUSE_LIST: Omit<House, 'score' | 'rank'>[] = [
  { name: 'Tagore', color: 'tagore' },
  { name: 'Gandhi', color: 'gandhi' },
  { name: 'Nehru', color: 'nehru' },
  { name: 'Delany', color: 'delany' },
];

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

  // Calculate houses scores and ranks from events with results
  const houses: House[] = HOUSE_LIST.map(house => {
    const score = events
      .filter(event => event.hasResults && event.winners)
      .flatMap(event => event.winners || [])
      .filter(winner => winner.house === house.name)
      .reduce((sum, winner) => sum + (winner.points || 0), 0);
    return { ...house, score, rank: 0 };
  });
  houses.sort((a, b) => b.score - a.score);
  houses.forEach((house, idx) => (house.rank = idx + 1));

  return {
    events,
    winners,
    houses,
    loading,
    addEvent,
    addEventTemplate,
    addWinnersToEvent,
    addWinnerPhoto,
    calculatePoints,
  };
};