import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import Header from "@/components/Header";

const Winners = () => {
  const { events, houses, winners } = useSparkData();

  // Map event results to winner cards
  // If a winner photo exists in the winners collection for this event+house+position, use it
  const getWinnerImage = (eventName, house, position) => {
    const match = winners.find(w => w.event === eventName && w.house === house && w.position === position);
    return match?.image || null;
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getPositionText = (position: number) => {
    switch (position) {
      case 1: return 'First Place';
      case 2: return 'Second Place';
      case 3: return 'Third Place';
      default: return `Position ${position}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">All Winners</h1>
          <p className="text-muted-foreground">Celebrating our SPARK champions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <Card key={event.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                {/* Winner Photo Placeholder or actual image if available */}
                <div className="w-24 h-24 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
                  {getWinnerImage(event.name, event.house, event.position) ? (
                    <img 
                      src={getWinnerImage(event.name, event.house, event.position)} 
                      alt={event.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Trophy className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                {/* Winner Details */}
                <div className="text-center space-y-3">
                  <div className="text-4xl">{getPositionIcon(event.position)}</div>
                  <h3 className="text-xl font-bold text-foreground">{event.name}</h3>
                  <p className="text-muted-foreground font-medium">{event.house}</p>
                  <Badge 
                    variant="outline" 
                    className={`border-${houses.find(h => h.name === event.house)?.color} text-${houses.find(h => h.name === event.house)?.color}-foreground bg-${houses.find(h => h.name === event.house)?.color}/10`}
                  >
                    {event.house} House
                  </Badge>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Medal className="h-4 w-4" />
                    <span>{getPositionText(event.position)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Winners;