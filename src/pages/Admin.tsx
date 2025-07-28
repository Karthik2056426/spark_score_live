import React, { useState } from 'react';
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

const Admin: React.FC = () => {
  const { events, eventTemplates, addEvent, calculatePoints } = useSparkData();
  const { toast } = useToast();
  const [eventSearchQuery, setEventSearchQuery] = useReactState('');
  
  const [eventForm, setEventForm] = useState({
    name: '',
    category: '',
    type: '',
    house: '',
    position: ''
  });

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

  const recentEvents = events.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <form onSubmit={handleSubmit} className="space-y-4">
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
                      <Label htmlFor="category">Grade Category</Label>
                      <Select value={eventForm.category} onValueChange={(value) => setEventForm({...eventForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Junior">Junior (1-5)</SelectItem>
                          <SelectItem value="Middle">Middle (6-8)</SelectItem>
                          <SelectItem value="Senior">Senior (9-12)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Event Type</Label>
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="house">House</Label>
                      <Select value={eventForm.house} onValueChange={(value) => setEventForm({...eventForm, house: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select house" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tagore">Tagore</SelectItem>
                          <SelectItem value="Delany">Delany</SelectItem>
                          <SelectItem value="Gandhi">Gandhi</SelectItem>
                          <SelectItem value="Nehru">Nehru</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Select value={eventForm.position} onValueChange={(value) => setEventForm({...eventForm, position: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Place</SelectItem>
                          <SelectItem value="2">2nd Place</SelectItem>
                          <SelectItem value="3">3rd Place</SelectItem>
                          <SelectItem value="4">4th Place</SelectItem>
                          <SelectItem value="5">5th Place</SelectItem>
                          <SelectItem value="6">6th Place</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {eventForm.type && eventForm.position && (
                      <div className="space-y-2">
                        <Label>Points Earned</Label>
                        <div className="text-2xl font-bold text-green-500">
                          +{calculatePoints(parseInt(eventForm.position), eventForm.type as 'Individual' | 'Group')} pts
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event Result
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
                    <Badge variant="outline">+{event.points}pts</Badge>
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
      </div>
    </div>
  );
};

export default Admin;