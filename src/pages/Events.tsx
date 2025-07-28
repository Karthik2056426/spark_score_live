import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import Header from "@/components/Header";

const Events = () => {
  const { events } = useSparkData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">All Events</h1>
          <p className="text-muted-foreground">Complete list of SPARK events</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <Card key={event.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{event.name}</span>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-primary text-primary">
                    {event.category}
                  </Badge>
                  <Badge variant={event.type === 'Individual' ? 'secondary' : 'default'}>
                    {event.type === 'Individual' ? <Users className="h-3 w-3 mr-1" /> : <Trophy className="h-3 w-3 mr-1" />}
                    {event.type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Date: {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  Points: <span className="font-semibold text-primary">{event.points}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  House: {event.house}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;