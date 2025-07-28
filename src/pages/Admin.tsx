import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, BarChart3, Users, Search, Camera } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import { useToast } from "@/hooks/use-toast";
import { useState as useReactState } from "react";
import Header from "@/components/Header";
import AddEventTemplateForm from "@/components/AddEventTemplateForm";
import AddWinnerPhotoForm from "@/components/AddWinnerPhotoForm";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Admin: React.FC = () => {
  const { events, eventTemplates, addEvent, calculatePoints } = useSparkData();
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
    house: '',
    position: ''
  });

  // Multi-winner event result form state
  const [multiWinners, setMultiWinners] = useState([
    { house: '', position: 1, studentName: '', studentClass: '' },
    { house: '', position: 2, studentName: '', studentClass: '' },
    { house: '', position: 3, studentName: '', studentClass: '' },
  ]);

  // Add a new winner row
  const addWinnerRow = () => {
    setMultiWinners(prev => [...prev, { house: '', position: prev.length + 1, studentName: '', studentClass: '' }]);
  };

  // Remove a winner row by index
  const removeWinnerRow = (idx: number) => {
    setMultiWinners(prev => prev.filter((_, i) => i !== idx));
  };

  // Update a winner row
  const updateWinnerRow = (idx: number, field: string, value: any) => {
    setMultiWinners(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.name || !eventForm.category || !eventForm.type || !eventForm.house || !eventForm.position) {
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
      category: eventForm.category as 'Junior' | 'Middle' | 'Senior',
      type: eventForm.type as 'Individual' | 'Group',
      house: eventForm.house,
      position: parseInt(eventForm.position),
      date: new Date().toISOString().split('T')[0]
    });

    toast({
      title: "Event Added Successfully",
      description: `${eventForm.house} earned ${points} points for ${eventForm.name}!`
    });

    // Reset form
    setEventForm({
      name: '',
      category: '',
      type: '',
      house: '',
      position: ''
    });
  };

  // New multi-winner event result submit
  const handleMultiWinnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.category || !eventForm.type) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields for the event.",
        variant: "destructive"
      });
      return;
    }
    const validWinners = multiWinners.filter(w => w.house && w.position && w.studentName && w.studentClass);
    if (validWinners.length === 0) {
      toast({
        title: "No Winners",
        description: "Please add at least one winner (with all details).",
        variant: "destructive"
      });
      return;
    }
    try {
      for (const winner of validWinners) {
        await addEvent({
          name: eventForm.name,
          category: eventForm.category as 'Junior' | 'Middle' | 'Senior',
          type: eventForm.type as 'Individual' | 'Group',
          house: winner.house,
          position: Number(winner.position),
          date: new Date().toISOString().split('T')[0],
          studentName: winner.studentName,
          studentClass: winner.studentClass,
        } as any);
      }
      toast({
        title: "Event Results Added",
        description: `${validWinners.length} winner(s) added for ${eventForm.name}`
      });
      setEventForm({ name: '', category: '', type: '', house: '', position: '' });
      setMultiWinners([
        { house: '', position: 1, studentName: '', studentClass: '' },
        { house: '', position: 2, studentName: '', studentClass: '' },
        { house: '', position: 3, studentName: '', studentClass: '' },
      ]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const recentEvents = events.slice(-5).reverse();

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      toast({ title: 'Event deleted' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  // Open edit modal
  const openEditModal = (event: Event) => {
    setEditEvent(event);
    setEditForm({ ...event });
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const { id, ...updateData } = editForm;
      await updateDoc(doc(db, 'events', editEvent!.id), updateData);
      setEditEvent(null);
      setEditForm(null);
      toast({ title: 'Event updated' });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  };

  // Login Modal
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
          <p className="text-muted-foreground">Manage SPARK - The Patrician Pulse events and scoring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Event Templates Form */}
          <div className="lg:col-span-2 space-y-6">
            <AddEventTemplateForm />
            
            {/* Add Event Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add New Event Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMultiWinnerSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventName">Event Name</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Select value={eventForm.name} onValueChange={(value) => setEventForm({...eventForm, name: value})}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Search and select event" />
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
                            {eventTemplates
                              .filter(event => 
                                event.name.toLowerCase().includes(eventSearchQuery.toLowerCase())
                              )
                              .map((event) => (
                                <SelectItem key={event.id} value={event.name}>
                                  {event.name} ({event.category})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={eventForm.category} onValueChange={(value) => setEventForm({...eventForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Junior">Junior (1-5)</SelectItem>
                          <SelectItem value="Middle">Middle (6-8)</SelectItem>
                          <SelectItem value="Senior">Senior (9-12)</SelectItem>
                          <SelectItem value="All">All Grades</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={eventForm.type} onValueChange={(value) => setEventForm({...eventForm, type: value})}>
                        <SelectTrigger>
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
                          <Label>House</Label>
                          <Select value={winner.house} onValueChange={value => updateWinnerRow(idx, 'house', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select house" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Tagore">Tagore</SelectItem>
                              <SelectItem value="Gandhi">Gandhi</SelectItem>
                              <SelectItem value="Nehru">Nehru</SelectItem>
                              <SelectItem value="Delany">Delany</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-40">
                          <Label>Student Name</Label>
                          <Input
                            value={winner.studentName}
                            onChange={e => updateWinnerRow(idx, 'studentName', e.target.value)}
                            placeholder="Enter name"
                            required
                          />
                        </div>
                        <div className="w-32">
                          <Label>Class</Label>
                          <Input
                            value={winner.studentClass}
                            onChange={e => updateWinnerRow(idx, 'studentClass', e.target.value)}
                            placeholder="e.g. 5A"
                            required
                          />
                        </div>
                        <div className="w-32">
                          <Label>Position</Label>
                          <Input
                            type="number"
                            value={winner.position}
                            onChange={e => updateWinnerRow(idx, 'position', e.target.value)}
                            min={1}
                            required
                          />
                        </div>
                        <div className="w-32 text-center">
                          <Label>Points</Label>
                          <div className="text-lg font-bold text-green-600 mt-1">
                            +{calculatePoints(Number(winner.position), eventForm.type as 'Individual' | 'Group')} pts
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addWinnerRow}>
                      + Add Winner
                    </Button>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event Result(s)
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Recent Events */}
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

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Recent Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                    <div>
                      <div className="font-medium text-sm">{event.name}</div>
                      <div className="text-xs text-muted-foreground">{event.house} • {event.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">+{event.points}pts</Badge>
                      <Button size="sm" variant="outline" onClick={() => openEditModal(event)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
                
                {recentEvents.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No events added yet</p>
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
                  <div>
                    <Label htmlFor="editHouse">House</Label>
                    <Input
                      id="editHouse"
                      value={editForm.house}
                      onChange={e => setEditForm(f => ({ ...f, house: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPosition">Position</Label>
                    <Input
                      id="editPosition"
                      type="number"
                      value={editForm.position}
                      onChange={e => setEditForm(f => ({ ...f, position: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPoints">Points</Label>
                    <Input
                      id="editPoints"
                      type="number"
                      value={editForm.points}
                      onChange={e => setEditForm(f => ({ ...f, points: Number(e.target.value) }))}
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