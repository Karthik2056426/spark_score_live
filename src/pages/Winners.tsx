import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import { useNavigate } from "react-router-dom";
import HouseCard from "@/components/HouseCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const Winners = () => {
  const { events, houses } = useSparkData();
  const [emblaApi, setEmblaApi] = useState<any>(null);
  const navigate = useNavigate();

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

  // Group winners by event name + category (only events with results)
  const eventsWithResults = events.filter(event => event.hasResults && event.winners);
  const eventWinnersMap = eventsWithResults.reduce((acc, event) => {
    // Create unique key using name + category to separate different categories of same event
    const eventKey = `${event.name} (${event.category})`;
    if (!acc[eventKey]) acc[eventKey] = [];
    // Add event info to each winner
    event.winners!.forEach(winner => {
      acc[eventKey].push({
        ...winner,
        eventName: event.name,
        eventCategory: event.category,
        eventType: event.type,
        eventDisplayName: eventKey
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

  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      'Cat1': 'Cat 1 (LKG- UKG)', 
      'Cat2': 'Cat 2 (class 1-2)', 
      'Cat3': 'Cat 3 (class 3-5)', 
      'Cat4': 'Cat 4 (class 6-8)', 
      'Cat5': 'Cat 5 (class 9-12)', 
      'All': 'All Categories',
      // Legacy mappings for existing data
      '1': 'Grade 1', '2': 'Grade 2', '3': 'Grade 3', '4': 'Grade 4', '5': 'Grade 5', '6': 'Grade 6',
      'Junior': 'Junior (1-5)', 'Middle': 'Middle (6-8)', 'Senior': 'Senior (9-12)'
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Live House Standings - Left Side */}
          <div className="lg:w-1/4 flex-shrink-0">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {houses.map((house, index) => (
                <div key={house.name} style={{ animationDelay: `${index * 0.2}s` }}>
                  <HouseCard house={house} />
                </div>
              ))}
            </div>
          </div>

          {/* Winners Carousel Section - Right Side */}
          <div className="lg:w-3/4 flex-1">
            <Carousel className="w-full" opts={{ loop: true }} setApi={setEmblaApi}>
          <CarouselContent>
            {Object.entries(eventWinnersMap).map(([eventName, winnersArr], idx) => (
              <CarouselItem key={eventName} className="px-2">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {winnersArr[0]?.eventName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryDisplay(winnersArr[0]?.eventCategory)}
                  </p>
                </div>
                <div className={`flex flex-wrap justify-center gap-4`}>
                  {winnersArr.map((winner, i) => {
                    // Calculate dynamic width based on number of winners
                    const numWinners = winnersArr.length;
                    let cardWidth = '';
                    let cardSize = '';
                    
                    if (numWinners <= 3) {
                      cardWidth = 'flex-1 min-w-[200px] max-w-sm'; // Large cards for 1-3 winners
                      cardSize = 'p-6';
                    } else if (numWinners <= 5) {
                      cardWidth = 'flex-1 min-w-[160px] max-w-[200px]'; // Medium cards for 4-5 winners
                      cardSize = 'p-4';
                    } else if (numWinners <= 8) {
                      cardWidth = 'flex-1 min-w-[140px] max-w-[160px]'; // Small cards for 6-8 winners
                      cardSize = 'p-3';
                    } else {
                      cardWidth = 'flex-1 min-w-[120px] max-w-[140px]'; // Extra small for 9+ winners
                      cardSize = 'p-2';
                    }
                    
                                         return (
                     <Card key={`${eventName}-${winner.house}-${winner.position}`} className={`${cardWidth} mx-2`}>
                                              <CardContent className={`flex flex-col items-center ${cardSize}`}>
                         {/* Position */}
                         <div className={`font-bold mb-2 ${numWinners <= 3 ? 'text-4xl' : numWinners <= 5 ? 'text-3xl' : numWinners <= 8 ? 'text-2xl' : 'text-xl'}`}>
                           {getPositionIcon(winner.position)}
                         </div>
                         {/* House pill */}
                         <div className={`rounded-full mb-3 font-semibold ${numWinners <= 3 ? 'px-4 py-1 text-sm' : numWinners <= 5 ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-xs'} ${getHouseColor(winner.house)}`}>
                           {winner.house}
                         </div>
                         {/* Winner photo: use uploaded image if available */}
                         <div className={`mb-3 rounded-full bg-secondary/30 flex items-center justify-center overflow-hidden ${numWinners <= 3 ? 'w-24 h-24' : numWinners <= 5 ? 'w-20 h-20' : numWinners <= 8 ? 'w-16 h-16' : 'w-12 h-12'}`}>
                           <img src={winner.image ? winner.image : "/public/placeholder.svg"} alt="Winner" className="w-full h-full object-cover" />
                         </div>
                         {/* Student name */}
                         <div className={`font-medium text-foreground mb-1 ${numWinners <= 3 ? 'text-lg' : numWinners <= 5 ? 'text-base' : numWinners <= 8 ? 'text-sm' : 'text-xs'}`}>
                           {winner.studentName || 'Student Name'}
                         </div>
                         {/* Points earned */}
                         <div className={`text-muted-foreground ${numWinners <= 3 ? 'text-base' : numWinners <= 5 ? 'text-sm' : 'text-xs'}`}>
                           +{winner.points || 0} pts
                         </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
          </div>
        </div>
      </div>
      
      {/* Back Button - Bottom Right */}
      <Button
        onClick={() => navigate('/')}
        className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        size="lg"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Home
      </Button>
    </div>
  );
};

export default Winners;