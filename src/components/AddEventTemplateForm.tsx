import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import { useToast } from "@/hooks/use-toast";

interface AddEventTemplateFormProps {
  onEventCreated?: (eventName: string) => void;
}

const AddEventTemplateForm: React.FC<AddEventTemplateFormProps> = ({ onEventCreated }) => {
  const { addEventTemplate } = useSparkData();
  const { toast } = useToast();
  
  const [eventForm, setEventForm] = useState({
    name: '',
    category: '',
    type: '',
    description: '',
    time: '',
    venue: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.name || !eventForm.category || !eventForm.type) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields (Event Name, Category, Type).",
        variant: "destructive"
      });
      return;
    }

    // Only include optional fields if they have a value
    const template: any = {
      name: eventForm.name,
      category: eventForm.category,
      type: eventForm.type as 'Individual' | 'Group',
    };
    if (eventForm.description) template.description = eventForm.description;
    if (eventForm.time) template.time = eventForm.time;
    if (eventForm.venue) template.venue = eventForm.venue;

    console.log('Creating event template:', template);
    await addEventTemplate(template);
    if (onEventCreated) onEventCreated(eventForm.name);
    toast({
      title: "Event Created Successfully",
      description: `${eventForm.name} has been added to the event list!`
    });

    // Reset form
    setEventForm({
      name: '',
      category: '',
      type: '',
      description: '',
      time: '',
      venue: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add New Event</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                value={eventForm.name}
                onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                placeholder="e.g., Poetry Recitation"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Grade Category *</Label>
              <Select value={eventForm.category} onValueChange={(value) => setEventForm({...eventForm, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cat1">Cat 1 (LKG- UKG)</SelectItem>
                  <SelectItem value="Cat2">Cat 2 (class 1-2)</SelectItem>
                  <SelectItem value="Cat3">Cat 3 (class 3-5)</SelectItem>
                  <SelectItem value="Cat4">Cat 4 (class 6-8)</SelectItem>
                  <SelectItem value="Cat5">Cat 5 (class 9-12)</SelectItem>
                  <SelectItem value="All">All Categories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Event Type *</Label>
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
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                value={eventForm.time}
                onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                placeholder="e.g., 10:00 AM"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={eventForm.venue}
                onChange={(e) => setEventForm({...eventForm, venue: e.target.value})}
                placeholder="e.g., Main Auditorium"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                placeholder="Brief description of the event..."
                rows={3}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddEventTemplateForm;