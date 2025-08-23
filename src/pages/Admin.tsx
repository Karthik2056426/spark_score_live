import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, BarChart3, Users, Search, Camera, Download, FileSpreadsheet } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import { useToast } from "@/hooks/use-toast";
import { exportAllData, exportSeparateFiles } from "@/lib/csvExport";
import { useState as useReactState } from "react";
import Header from "@/components/Header";
import AddEventTemplateForm from "@/components/AddEventTemplateForm";
import AddWinnerPhotoForm from "@/components/AddWinnerPhotoForm";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import axios from 'axios';

const CLOUDINARY_UPLOAD_PRESET = 'SPA-juniors';
const CLOUDINARY_CLOUD_NAME = 'dz9oojl6x';

const Admin: React.FC = () => {
  const { events, grades, gradesByLevel, addEvent, addEventTemplate, addWinnersToEvent, calculatePoints, GRADE_SECTIONS, GRADE_LIST } = useSparkData();
  const { toast } = useToast();
  const [eventSearchQuery, setEventSearchQuery] = useReactState('');
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [resultSubmissionLoading, setResultSubmissionLoading] = useState(false);
  const lastCreatedEventNameRef = useRef<string | null>(null);
  const [eventsSearchQuery, setEventsSearchQuery] = useState('');

  // 1. Show all events in the results dropdown (not just those without results)
  const allEvents = events; // No filter

  // 2. Add state for editing mode and selected event's winners
  const [editingWinners, setEditingWinners] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [customResultsMode, setCustomResultsMode] = useState(true); // Locked to custom mode

  // Get events without results (templates)
  // Handle legacy events that might not have hasResults field
  const eventTemplates = events.filter(event => !event.hasResults && (!event.winners || event.winners.length === 0));

  // Get events with results
  const eventsWithResults = events.filter(event => event.hasResults || (event.winners && event.winners.length > 0));

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setShowLogin(!user);
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      setShowLogin(false);
      toast({ title: "Login Successful" });
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setShowLogin(true);
    toast({ title: "Logged out" });
    navigate('/');
  };

  const [eventForm, setEventForm] = useState({
    name: '',
    category: '',
    type: '',
    grade: '',
    section: '',
    position: '',
    selectedEventId: '' // Add this to store the selected event ID
  });

  // Prevent form from being reset unnecessarily
  const updateEventForm = useCallback((updates: Partial<typeof eventForm>) => {
    console.log('DEBUG: updateEventForm called with:', updates);
    setEventForm(prev => {
      const newForm = { ...prev, ...updates };
      console.log('Updating eventForm from:', prev, 'to:', newForm);
      return newForm;
    });
  }, []);

  // Use ref to track selected event and prevent reset
  const selectedEventRef = useRef<string>('');

  // Debug: Log eventForm changes
  useEffect(() => {
    console.log('eventForm changed:', eventForm);
    if (eventForm.selectedEventId && !eventForm.name) {
      console.log('WARNING: Form has selectedEventId but no name - this might indicate a reset issue');
    }
  }, [eventForm]);

  // Debug: Log eventTemplates to console
  useEffect(() => {
    console.log('=== EVENTS DEBUG ===');
    console.log('All Events from Firebase:', events);
    console.log('Event Templates (no results):', eventTemplates);
    console.log('Events with Results:', eventsWithResults);
    console.log('Events with hasResults field:', events.filter(e => e.hasResults !== undefined));
    console.log('Events without hasResults field:', events.filter(e => e.hasResults === undefined));
    console.log('=== END DEBUG ===');
  }, [events, eventTemplates, eventsWithResults]);

  // Debug: Log all events from Firestore
  useEffect(() => {
    console.log('DEBUG: All events from Firestore:', events);
  }, [events]);

  // Helper function to get display text for selected event
  const getSelectedEventDisplay = () => {
    const selectedEventId = eventForm.selectedEventId;
    console.log('DEBUG: getSelectedEventDisplay - selectedEventId:', selectedEventId, 'Type:', typeof selectedEventId);
    const selectedEvent = allEvents.find(e => String(e.id) === String(selectedEventId));
    console.log('DEBUG: getSelectedEventDisplay - found event:', selectedEvent);
    if (!selectedEvent) return "Search and select event";
    const getCategoryDisplay = (category: string) => {
      const categoryMap: Record<string, string> = {
        'LKG': 'LKG',
        'UKG': 'UKG', 
        '1': 'Grade 1',
        '2': 'Grade 2',
        '3': 'Grade 3',
        '4': 'Grade 4',
        'All': 'All Grades',
        // Legacy mappings for existing data
        'Cat1': 'Cat 1 (LKG- UKG)', 
        'Cat2': 'Cat 2 (class 1-2)', 
        'Cat3': 'Cat 3 (class 3-5)', 
        'Cat4': 'Cat 4 (class 6-8)', 
        'Cat5': 'Cat 5 (class 9-12)',
        'Junior': 'Junior (1-5)', 'Middle': 'Middle (6-8)', 'Senior': 'Senior (9-12)'
      };
      return categoryMap[category] || category;
    };
    return `${selectedEvent.name} (${getCategoryDisplay(selectedEvent.category)})`;
  };

  // Multi-winner event result form state
  const [multiWinners, setMultiWinners] = useState([
    { grade: '', section: '', position: 1, points: 0, studentName: '', image: '' },
    { grade: '', section: '', position: 2, points: 0, studentName: '', image: '' },
    { grade: '', section: '', position: 3, points: 0, studentName: '', image: '' },
  ]);

  // Add a new winner row
  const addWinnerRow = () => {
    setMultiWinners(prev => [...prev, { grade: '', section: '', position: prev.length + 1, points: 0, studentName: '', image: '' }]);
  };

  // Remove a winner row by index
  const removeWinnerRow = (idx: number) => {
    setMultiWinners(prev => prev.filter((_, i) => i !== idx));
  };

  // Update a winner row
  const updateWinnerRow = (idx: number, field: string, value: any) => {
    setMultiWinners(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file: File, winnerIndex: number) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      
      const imageUrl = response.data.secure_url;
      updateWinnerRow(winnerIndex, 'image', imageUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Winner photo uploaded successfully!"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    }
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.name || !eventForm.category || !eventForm.type || !eventForm.grade || !eventForm.position) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const points = calculatePoints(parseInt(eventForm.position), eventForm.type as 'Individual' | 'Group');
    
    addEvent({
      name: eventForm.name,
      category: eventForm.category,
      type: eventForm.type as 'Individual' | 'Group'
    });

    toast({
      title: "Event Added Successfully",
      description: `${eventForm.grade}-${eventForm.section} earned ${points} points for ${eventForm.name}!`
    });

    // Reset form
    setEventForm({
      name: '',
      category: '',
      type: '',
      grade: '',
      section: '',
      position: '',
      selectedEventId: ''
    });
  };

  // New multi-winner event result submit
  const handleMultiWinnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (resultSubmissionLoading) {
      return;
    }
    
    if (!eventForm.selectedEventId || !eventForm.category || !eventForm.type) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields for the event.",
        variant: "destructive"
      });
      return;
    }
    
    setResultSubmissionLoading(true);
    const selectedEvent = allEvents.find(e => e.id === eventForm.selectedEventId);
    if (!selectedEvent) {
      toast({
        title: "Event Not Found",
        description: "Selected event not found.",
        variant: "destructive"
      });
      return;
    }
    const validWinners = multiWinners.filter(w => w.grade && w.section && w.position && w.points >= 0 && w.studentName.trim());
    if (validWinners.length === 0) {
      toast({
        title: "No Winners",
        description: "Please add at least one winner (with all details).",
        variant: "destructive"
      });
      return;
    }
    try {
      const winnersWithPoints = validWinners.map(winner => ({
        grade: winner.grade as 'LKG' | 'UKG' | '1' | '2' | '3' | '4',
        section: winner.section as 'A' | 'B' | 'C' | 'D' | 'E',
        gradeSection: `${winner.grade}-${winner.section}`,
        position: Number(winner.position),
        studentName: winner.studentName.trim(),
        studentClass: `${winner.grade}`,
        points: Number(winner.points),
        image: winner.image || ''
      }));
      // 2. If editing, update winners; else, add winners
      await addWinnersToEvent(eventForm.selectedEventId, winnersWithPoints);
      toast({
        title: isEditing ? "Results Updated" : "Event Results Added",
        description: `${validWinners.length} winner(s) ${isEditing ? 'updated' : 'added'} for ${selectedEvent.name}`
      });
      setEventForm({ name: '', category: '', type: '', grade: '', section: '', position: '', selectedEventId: '' });
      setMultiWinners([
        { grade: '', section: '', position: 1, points: 0, studentName: '', image: '' },
        { grade: '', section: '', position: 2, points: 0, studentName: '', image: '' },
        { grade: '', section: '', position: 3, points: 0, studentName: '', image: '' },
      ]);
      setIsEditing(false);
      setEditingWinners([]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setResultSubmissionLoading(false);
    }
  };

  const allEventsList = events.reverse(); // Show all events, newest first
  
  // Filter events based on search query
  const filteredEventsList = allEventsList.filter(event => 
    (event.name || '').toLowerCase().includes(eventsSearchQuery.toLowerCase()) ||
    (event.category || '').toLowerCase().includes(eventsSearchQuery.toLowerCase()) ||
    (event.type || '').toLowerCase().includes(eventsSearchQuery.toLowerCase())
  );

  // Delete event template
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      toast({ title: 'Event template deleted' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  // Open edit modal
  const openEditModal = (event: any) => {
    setEditEvent(event);
    setEditForm({ ...event });
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const { id, ...updateData } = editForm;
      if (editEvent && (editEvent as any).id) {
        await updateDoc(doc(db, 'events', (editEvent as any).id), updateData);
      }
      setEditEvent(null);
      setEditForm(null);
      toast({ title: 'Event template updated' });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  };

  // Only auto-select after event creation
  useEffect(() => {
    if (lastCreatedEventNameRef.current && eventTemplates.length > 0) {
      const found = eventTemplates.find(e => e.name === lastCreatedEventNameRef.current);
      if (found) {
        updateEventForm({
          selectedEventId: found.id,
          name: found.name,
          category: found.category,
          type: found.type
        });
        selectedEventRef.current = found.id;
        lastCreatedEventNameRef.current = null; // Reset after selection
      }
    }
    // Only run when eventTemplates changes
    // eslint-disable-next-line
  }, [eventTemplates]);

  // Place conditional return for login after all hooks
  if (showLogin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <Card className="w-full max-w-sm mx-auto animate-fade-in">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEventCreated = (eventName: string) => {
    lastCreatedEventNameRef.current = eventName;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
          {user && (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage SPARKLE events and scoring</p>
          
          {/* CSV Export Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={() => {
                // exportAllData(events, grades); // TODO: Update csvExport to use grades
                toast({
                  title: "Export Disabled",
                  description: "CSV export temporarily disabled - needs grade update",
                });
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export All Data (Single File)
            </Button>
            
            <Button
              onClick={() => {
                // exportSeparateFiles(events, grades); // TODO: Update csvExport to use grades
                toast({
                  title: "Export Disabled",
                  description: "CSV export temporarily disabled - needs grade update",
                });
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Separate Files
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Event Templates Form */}
          <div className="lg:col-span-2 space-y-6">
            <AddEventTemplateForm onEventCreated={handleEventCreated} />
            
            {/* Add Event Result */}
            <Card className={isEditing ? "border-orange-500 bg-orange-50/50" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Trophy className="h-5 w-5 text-orange-600" />
                      <span className="text-orange-600">Edit Event Results</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Editing Mode
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span>Add Event Results (Winners)</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && (
                  <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Edit Mode:</strong> You are editing existing results for this event. 
                      Make your changes and click "Save Results" to update.
                    </p>
                  </div>
                )}
                {/* Results Mode - Locked to Custom */}
                <div className="mb-6 p-4 bg-secondary/20 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Results Mode</h3>
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Custom Mode (Active)
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="space-y-1">
                      <p>🎯 <strong>Custom Mode:</strong> Set any position and points for each winner</p>
                      <p>• Perfect for special events with unique scoring</p>
                      <p>• Full control over positions and point values</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleMultiWinnerSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventName">Select Event</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Select value={eventForm.selectedEventId} onValueChange={(value) => {
                          console.log('DEBUG: onValueChange called with value:', value, 'Type:', typeof value);
                          console.log('DEBUG: Available event IDs:', allEvents.map(e => ({ id: e.id, type: typeof e.id })));
                          const selectedEvent = allEvents.find(e => String(e.id) === String(value));
                          console.log('DEBUG: Found selected event:', selectedEvent);
                          if (selectedEvent) {
                            // Keep category as-is for new grade system
                            let normalizedCategory = selectedEvent.category;
                            console.log('DEBUG: Original category:', selectedEvent.category, 'Normalized category:', normalizedCategory);
                            // Normalize type
                            let normalizedType = selectedEvent.type;
                            if (normalizedType !== "Individual" && normalizedType !== "Group") {
                              normalizedType = "Individual";
                            }
                            updateEventForm({
                              selectedEventId: value,
                              name: selectedEvent.name,
                              category: normalizedCategory,
                              type: normalizedType
                            });
                            selectedEventRef.current = value;
                            // 2. If event has winners, pre-fill for editing
                            if (selectedEvent.winners && selectedEvent.winners.length > 0) {
                              setEditingWinners(selectedEvent.winners);
                              setIsEditing(true);
                              // Map existing winners to new format
                              setMultiWinners(selectedEvent.winners.map(w => ({
                                grade: w.grade || '',
                                section: w.section || '',
                                position: w.position || 1,
                                points: w.points || 0,
                                studentName: w.studentName || '',
                                image: w.image || ''
                              })));
                            } else {
                              setEditingWinners([]);
                              setIsEditing(false);
                              setMultiWinners([
                                { grade: '', section: '', position: 1, points: 0, studentName: '', image: '' },
                                { grade: '', section: '', position: 2, points: 0, studentName: '', image: '' },
                                { grade: '', section: '', position: 3, points: 0, studentName: '', image: '' },
                              ]);
                            }
                          }
                        }}>
                          <SelectTrigger id="eventName" className="pl-10">
                            <SelectValue placeholder={allEvents.length === 0 ? "No events available" : "Search and select event"}>
                              {allEvents.length === 0 ? (
                                <span className="text-muted-foreground">No events available. Please add an event first.</span>
                              ) : (
                                eventForm.selectedEventId ? getSelectedEventDisplay() : "Search and select event"
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search events..."
                                value={eventSearchQuery}
                                onChange={(e) => setEventSearchQuery(e.target.value)}
                                className="mb-2"
                              />
                            </div>
                            {allEvents
                              .filter(event => (event.name || '').toLowerCase().includes(eventSearchQuery.toLowerCase()))
                              .map((event) => {
                                console.log('DEBUG: Dropdown option:', event, 'ID:', event.id, 'Name:', event.name, 'Type of ID:', typeof event.id);
                                // Map category values to display names
                                const getCategoryDisplay = (category: string) => {
                                  const categoryMap: Record<string, string> = {
                                    'LKG': 'LKG',
                                    'UKG': 'UKG', 
                                    '1': 'Grade 1',
                                    '2': 'Grade 2',
                                    '3': 'Grade 3',
                                    '4': 'Grade 4',
                                    'All': 'All Grades',
                                    // Legacy mappings for existing data
                                    'Cat1': 'Cat 1 (LKG- UKG)', 
                                    'Cat2': 'Cat 2 (class 1-2)', 
                                    'Cat3': 'Cat 3 (class 3-5)', 
                                    'Cat4': 'Cat 4 (class 6-8)', 
                                    'Cat5': 'Cat 5 (class 9-12)',
                                    'Junior': 'Junior (1-5)',
                                    'Middle': 'Middle (6-8)',
                                    'Senior': 'Senior (9-12)'
                                  };
                                  return categoryMap[category] || category;
                                };
                                
                                return (
                                  <SelectItem key={String(event.id)} value={String(event.id)}>
                                    {(event.name && event.name.trim()) ? event.name : '[No Name]'} ({getCategoryDisplay(event.category)})
                                    {event.winners && event.winners.length > 0 && (
                                      <span className="ml-2 text-xs text-green-600">(Results exist)</span>
                                    )}
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                        {/* Debug display */}
                        <div className="mt-2 text-xs text-muted-foreground">
                          Debug: Selected ID: {eventForm.selectedEventId || 'None'} | 
                          Name: {allEvents.find(e => e.id === eventForm.selectedEventId)?.name || 'None'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={eventForm.category} onValueChange={(value) => setEventForm({...eventForm, category: value})}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LKG">LKG</SelectItem>
                          <SelectItem value="UKG">UKG</SelectItem>
                          <SelectItem value="1">Grade 1</SelectItem>
                          <SelectItem value="2">Grade 2</SelectItem>
                          <SelectItem value="3">Grade 3</SelectItem>
                          <SelectItem value="4">Grade 4</SelectItem>
                          <SelectItem value="All">All Grades</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={eventForm.type} onValueChange={(value) => setEventForm({...eventForm, type: value})}>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Individual">Individual</SelectItem>
                          <SelectItem value="Group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {multiWinners.map((winner, idx) => (
                      <div key={idx} className="flex items-center gap-2 border rounded-lg p-3 relative bg-secondary/10">
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                          onClick={() => removeWinnerRow(idx)}
                          title="Remove winner"
                        >
                          ×
                        </button>
                        <div className="flex-1">
                          <Label htmlFor={`grade-${idx}`}>Grade</Label>
                          <Select value={winner.grade} onValueChange={value => updateWinnerRow(idx, 'grade', value)}>
                            <SelectTrigger id={`grade-${idx}`}>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LKG">LKG</SelectItem>
                              <SelectItem value="UKG">UKG</SelectItem>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-32">
                          <Label htmlFor={`section-${idx}`}>Section</Label>
                          <Select value={winner.section} onValueChange={value => updateWinnerRow(idx, 'section', value)}>
                            <SelectTrigger id={`section-${idx}`}>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                              {winner.grade && GRADE_SECTIONS.find(g => g.level === winner.grade)?.sections.map(section => (
                                <SelectItem key={section} value={section}>{section}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="w-20">
                          <Label htmlFor={`position-${idx}`}>Position</Label>
                          <Input
                            id={`position-${idx}`}
                            type="number"
                            value={winner.position}
                            onChange={e => updateWinnerRow(idx, 'position', e.target.value)}
                            min={1}
                            required
                          />
                        </div>
                        <div className="w-24">
                          <Label htmlFor={`points-${idx}`}>Points</Label>
                          {true ? ( // Always show custom mode input
                            <Input
                              id={`points-${idx}`}
                              type="number"
                              value={winner.points || ''}
                              onChange={e => updateWinnerRow(idx, 'points', e.target.value)}
                              placeholder="Custom points"
                              min={0}
                              required
                            />
                          ) : (
                            <div className="text-lg font-bold text-green-600 mt-1 text-center">
                              +{calculatePoints(Number(winner.position), eventForm.type as 'Individual' | 'Group')} pts
                            </div>
                          )}
                        </div>
                        <div className="flex-[2]">
                          <Label htmlFor={`studentName-${idx}`}>Student Name</Label>
                          <Input
                            id={`studentName-${idx}`}
                            type="text"
                            value={winner.studentName}
                            onChange={e => updateWinnerRow(idx, 'studentName', e.target.value)}
                            placeholder="Enter student name"
                            required
                          />
                        </div>
                        <div className="w-40">
                          <Label htmlFor={`image-${idx}`}>Photo</Label>
                          <div className="space-y-2">
                            <Input
                              id={`image-${idx}`}
                              type="file"
                              accept="image/*"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(file, idx);
                                }
                              }}
                              className="text-sm"
                            />
                            {winner.image && (
                              <div className="relative">
                                <img 
                                  src={winner.image} 
                                  alt="Winner" 
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateWinnerRow(idx, 'image', '')}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                                  title="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addWinnerRow}>
                      + Add Winner
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={resultSubmissionLoading}
                    >
                      {resultSubmissionLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isEditing ? 'Saving...' : 'Adding...'}
                        </>
                      ) : (
                        isEditing ? 'Save Results' : 'Add Results'
                      )}
                    </Button>
                    {isEditing && (
                      <Button 
                        type="button" 
                        variant="outline"
                        disabled={resultSubmissionLoading}
                        onClick={() => {
                          // Reset edit mode
                          setIsEditing(false);
                          setEditingWinners([]);
                          // Reset form
                          setEventForm({ name: '', category: '', type: '', grade: '', section: '', position: '', selectedEventId: '' });
                          // Reset winners to default
                          setMultiWinners([
                            { grade: '', section: '', position: 1, points: 0, studentName: '', image: '' },
                            { grade: '', section: '', position: 2, points: 0, studentName: '', image: '' },
                            { grade: '', section: '', position: 3, points: 0, studentName: '', image: '' },
                          ]);
                          // Clear selected event ref
                          selectedEventRef.current = '';
                          // Show feedback
                          toast({
                            title: "Edit Cancelled",
                            description: "Changes discarded and edit mode disabled.",
                            variant: "default"
                          });
                        }}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Stats & All Events */}
          <div className="space-y-6">
            {/* Add Winner Photo */}
            <AddWinnerPhotoForm />
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Events</span>
                  <span className="font-bold text-xl">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Individual Events</span>
                  <span className="font-bold">{events.filter(e => e.type === 'Individual').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Group Events</span>
                  <span className="font-bold">{events.filter(e => e.type === 'Group').length}</span>
                </div>
              </CardContent>
            </Card>

            {/* All Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>All Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events by name, category, or type..."
                    value={eventsSearchQuery}
                    onChange={(e) => setEventsSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {filteredEventsList.map((event) => (
                  <div key={event.id} className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                    <div>
                      <div className="font-medium text-sm">{event.name}</div>
                      <div className="text-xs text-muted-foreground">{event.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(event)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
                
                {filteredEventsList.length === 0 && allEventsList.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No events added yet</p>
                  </div>
                )}
                
                {filteredEventsList.length === 0 && allEventsList.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No events match your search</p>
                    <p className="text-xs">Try different keywords or clear the search</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Edit Event Modal */}
        {editEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <Card className="w-full max-w-md mx-auto animate-fade-in">
              <CardHeader>
                <CardTitle>Edit Event</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="editName">Event Name</Label>
                    <Input
                      id="editName"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCategory">Category</Label>
                    <Input
                      id="editCategory"
                      value={editForm.category}
                      onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editType">Type</Label>
                    <Input
                      id="editType"
                      value={editForm.type}
                      onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setEditEvent(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={editLoading}>
                      {editLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;