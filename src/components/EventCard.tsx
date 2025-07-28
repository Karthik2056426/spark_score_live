import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, User } from "lucide-react";

export interface EventData {
  id: string;
  name: string;
  category: string;
  type: 'Individual' | 'Group';
  description?: string;
  date?: string;
  time?: string;
  venue?: string;
}

interface EventCardProps {
  event: EventData;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-primary border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold text-foreground">{event.name}</CardTitle>
          <div className="flex items-center space-x-1 text-muted-foreground">
            {event.type === 'Individual' ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {event.category}
          </Badge>
          <Badge variant={event.type === 'Individual' ? 'default' : 'secondary'} className="text-xs">
            {event.type}
          </Badge>
        </div>
        
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        
        {(event.date || event.time || event.venue) && (
          <div className="space-y-1 text-sm text-muted-foreground">
            {event.date && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3" />
                <span>{event.date}</span>
              </div>
            )}
            {event.time && (
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 flex items-center justify-center text-xs">🕐</span>
                <span>{event.time}</span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 flex items-center justify-center text-xs">📍</span>
                <span>{event.venue}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;