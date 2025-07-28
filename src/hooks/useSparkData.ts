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

export interface Event {
  id: string;
  name: string;
  category: 'Junior' | 'Middle' | 'Senior';
  type: 'Individual' | 'Group';
  house: string;
  position: number;
  points: number;
  date: string;
}

export interface EventTemplate {
  id: string;
  name: string;
  category: string;
  type: 'Individual' | 'Group';
  description?: string;
  date?: string;
  time?: string;
  venue?: string;
}

export interface Winner {
  id: string;
  name: string;
  event: string;
  house: string;
  position: number;
  image?: string;
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
  const [winners, setWinners] = useState<Winner[]>([]);
  const [eventTemplates, setEventTemplates] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch and listen to Firestore collections (events, eventTemplates, winners)
  useEffect(() => {
    setLoading(true);
    // Events
    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
      setEvents(data);
    });
    // Event Templates
    const unsubEventTemplates = onSnapshot(collection(db, 'eventTemplates'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EventTemplate[];
      setEventTemplates(data);
    });
    // Winners
    const unsubWinners = onSnapshot(collection(db, 'winners'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Winner[];
      setWinners(data);
    });
    setLoading(false);
    return () => {
      unsubEvents();
      unsubEventTemplates();
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
  const addEvent = useCallback(async (newEvent: Omit<Event, 'id' | 'points'>) => {
    const points = calculatePoints(newEvent.position, newEvent.type);
    const event = {
      ...newEvent,
      points,
      date: newEvent.date || new Date().toISOString().split('T')[0],
    };
    await addDoc(collection(db, 'events'), event);
  }, []);

  // Add new event template
  const addEventTemplate = useCallback(async (newEventTemplate: Omit<EventTemplate, 'id'>) => {
    await addDoc(collection(db, 'eventTemplates'), newEventTemplate);
  }, []);

  // Add winner photo
  const addWinnerPhoto = useCallback(async (winnerId: string, imageUrl: string) => {
    await updateDoc(doc(db, 'winners', winnerId), { image: imageUrl });
  }, []);

  // Calculate house scores and ranks from events
  const houses: House[] = HOUSE_LIST.map(house => {
    const score = events
      .filter(event => event.house === house.name)
      .reduce((sum, event) => sum + (event.points || 0), 0);
    return { ...house, score, rank: 0 };
  });
  // Sort and assign ranks
  houses.sort((a, b) => b.score - a.score);
  houses.forEach((house, idx) => (house.rank = idx + 1));

  return {
    houses,
    events,
    winners,
    eventTemplates,
    loading,
    addEvent,
    addEventTemplate,
    addWinnerPhoto,
    calculatePoints,
  };
};