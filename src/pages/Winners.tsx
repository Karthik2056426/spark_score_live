import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Header from "@/components/Header";

const Winners = () => {
  const { events } = useSparkData();
  const [emblaApi, setEmblaApi] = useState<any>(null);

  // Auto-advance carousel every 10 seconds
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 10000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  // Get all winners from events with results
  const allWinners = events
    .filter(event => event.hasResults && event.winners && event.winners.length > 0)
    .flatMap(event => 
      event.winners!.map(winner => ({
        ...winner,
        eventName: event.name,
        eventCategory: event.category,
        eventType: event.type
      }))
    );

  const getGradeColor = (gradeSection: string) => {
    const level = gradeSection?.split('-')[0];
    switch (level?.toLowerCase()) {
      case 'lkg': return 'bg-red-500 text-white border-red-300';
      case 'ukg': return 'bg-orange-500 text-white border-orange-300';
      case '1': return 'bg-yellow-500 text-white border-yellow-300';
      case '2': return 'bg-green-500 text-white border-green-300';
      case '3': return 'bg-blue-500 text-white border-blue-300';
      case '4': return 'bg-purple-500 text-white border-purple-300';
      default: return 'bg-gray-500 text-white border-gray-300';
    }
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
      case 1: return '1st Place';
      case 2: return '2nd Place';
      case 3: return '3rd Place';
      default: return `${position}th Place`;
    }
  };

  if (allWinners.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Winners Yet</h2>
            <p className="text-muted-foreground">Winners will appear here as events are completed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">🏆 Winners Gallery</h1>
          <p className="text-muted-foreground">Celebrating our SPARKLE champions - Auto-rotating every 10 seconds</p>
        </div>

        {/* Winners Carousel */}
        <div className="max-w-4xl mx-auto">
          <Carousel className="w-full" opts={{ loop: true }} setApi={setEmblaApi}>
            <CarouselContent>
              {allWinners.map((winner, index) => (
                <CarouselItem key={`${winner.eventName}-${winner.gradeSection}-${winner.position}`}>
                  <Card className="border-2 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Left Side - Winner Photo and Basic Info */}
                        <div className="text-center space-y-4">
                          {/* Winner Photo */}
                          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-secondary/20 flex items-center justify-center shadow-lg">
                            {winner.image ? (
                              <img 
                                src={winner.image} 
                                alt={winner.studentName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Trophy className="h-16 w-16 text-muted-foreground" />
                            )}
                          </div>

                          {/* Student Name */}
                          <div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">
                              {winner.studentName}
                            </h2>
                            <p className="text-lg text-muted-foreground">
                              Class {winner.studentClass}
                            </p>
                          </div>

                          {/* Grade & Section Badge */}
                          <Badge 
                            className={`text-lg px-4 py-2 ${getGradeColor(winner.gradeSection)}`}
                          >
                            Grade {winner.gradeSection}
                          </Badge>
                        </div>

                        {/* Right Side - Event Details and Achievement */}
                        <div className="space-y-6 text-center md:text-left">
                          {/* Position Achievement */}
                          <div className="space-y-3">
                            <div className="text-6xl">
                              {getPositionIcon(winner.position)}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-foreground">
                                {getPositionText(winner.position)}
                              </h3>
                              <p className="text-muted-foreground">
                                in {winner.eventType} Event
                              </p>
                            </div>
                          </div>

                          {/* Event Information */}
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-xl font-semibold text-foreground mb-1">
                                Event
                              </h4>
                              <p className="text-lg text-muted-foreground">
                                {winner.eventName}
                              </p>
                            </div>

                            {/* Points Earned */}
                            <div className="bg-primary/10 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-foreground mb-1">
                                Points Earned
                              </h4>
                              <div className="text-3xl font-bold text-primary">
                                +{winner.points} pts
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {allWinners.slice(0, 10).map((_, index) => (
              <button
                key={index}
                className="w-3 h-3 rounded-full bg-muted hover:bg-primary transition-colors"
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{allWinners.length}</span> winners 
              from <span className="font-semibold text-foreground">{events.filter(e => e.hasResults).length}</span> completed events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Winners;