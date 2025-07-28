import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import Header from "@/components/Header";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const Winners = () => {
  const { events } = useSparkData();
  const [emblaApi, setEmblaApi] = useState<any>(null);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

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

  // Group winners by event name (only events with results)
  const eventsWithResults = events.filter(event => event.hasResults && event.winners);
  const eventWinnersMap = eventsWithResults.reduce((acc, event) => {
    if (!acc[event.name]) acc[event.name] = [];
    // Add event info to each winner
    event.winners!.forEach(winner => {
      acc[event.name].push({
        ...winner,
        eventName: event.name,
        eventCategory: event.category,
        eventType: event.type
      });
    });
    return acc;
  }, {} as Record<string, any[]>);

  // Sort winners by position within each event
  Object.keys(eventWinnersMap).forEach(eventName => {
    eventWinnersMap[eventName].sort((a, b) => a.position - b.position);
  });

  const getHouseColor = (houseName: string) => {
    switch (houseName?.toLowerCase()) {
      case 'tagore': return 'bg-tagore text-white';
      case 'delany': return 'bg-delany text-white';
      case 'gandhi': return 'bg-gandhi text-white';
      case 'nehru': return 'bg-nehru text-white';
      default: return 'bg-secondary text-foreground';
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
        <Carousel className="w-full" opts={{ loop: true }} setApi={setEmblaApi}>
          <CarouselContent>
            {Object.entries(eventWinnersMap).map(([eventName, winnersArr], idx) => (
              <CarouselItem key={eventName} className="px-2">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{eventName}</h2>
                </div>
                <div className={`flex flex-wrap justify-center gap-6`}>
                  {winnersArr.map((winner, i) => (
                    <Card key={`${eventName}-${winner.house}-${winner.position}`} className="flex-1 min-w-[220px] max-w-xs mx-2">
                      <CardContent className="flex flex-col items-center p-6">
                        {/* Position */}
                        <div className="text-4xl font-bold mb-2">{getPositionIcon(winner.position)}</div>
                        {/* House pill */}
                        <div className={`rounded-full px-4 py-1 mb-3 font-semibold text-sm ${getHouseColor(winner.house)}`}>{winner.house}</div>
                        {/* Winner photo: use uploaded image if available */}
                        <div className="w-24 h-24 mb-3 rounded-full bg-secondary/30 flex items-center justify-center overflow-hidden">
                          <img src={winner.image ? winner.image : "/public/placeholder.svg"} alt="Winner" className="w-full h-full object-cover" />
                        </div>
                        {/* Student name */}
                        <div className="text-lg font-medium text-foreground mb-1">{winner.studentName || 'Student Name'}</div>
                        {/* Points earned */}
                        <div className="text-base text-muted-foreground">+{winner.points || 0} pts</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default Winners;