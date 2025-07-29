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

  const getPositionDisplay = (position: number) => {
    return `#${position}`;
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
          <div className="lg:w-1/5 flex-shrink-0">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {houses.map((house, index) => (
                <div key={house.name} style={{ animationDelay: `${index * 0.2}s` }}>
                  <HouseCard house={house} />
                </div>
              ))}
            </div>
          </div>

          {/* Winners Carousel Section - Right Side */}
          <div className="lg:w-4/5 flex-1">
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
                <div className={`grid gap-2 justify-items-center items-stretch`} style={{
                  gridTemplateColumns: (() => {
                    const numWinners = winnersArr.length;
                    if (numWinners <= 3) {
                      return `repeat(${numWinners}, 1fr)`; // Single row for 1-3
                    } else if (numWinners === 4) {
                      return 'repeat(2, 1fr)'; // 2x2 grid for 4
                    } else if (numWinners === 5) {
                      return 'repeat(3, 1fr)'; // 3 columns for 5 (3 top, 2 bottom)
                    } else if (numWinners === 6) {
                      return 'repeat(3, 1fr)'; // 3 columns for 6 (3 top, 3 bottom)
                    } else if (numWinners <= 8) {
                      return 'repeat(4, 1fr)'; // 4 columns for 7-8
                    } else {
                      return 'repeat(4, 1fr)'; // 4 columns for 9+
                    }
                  })()
                }}>
                  {winnersArr.map((winner, i) => {
                    const numWinners = winnersArr.length;
                    const studentName = winner.studentName || 'Student Name';
                    
                    // Calculate dynamic font size based on name length
                    const getNameFontSize = (name: string, baseSize: string) => {
                      const nameLength = name.length;
                      if (nameLength <= 12) return baseSize;
                      if (nameLength <= 18) {
                        // Reduce by one size
                        if (baseSize === 'text-xl') return 'text-lg';
                        if (baseSize === 'text-lg') return 'text-base';
                        if (baseSize === 'text-base') return 'text-sm';
                        return 'text-sm';
                      }
                      // For very long names, reduce by two sizes
                      if (baseSize === 'text-xl') return 'text-base';
                      if (baseSize === 'text-lg') return 'text-sm';
                      if (baseSize === 'text-base') return 'text-xs';
                      return 'text-xs';
                    };
                    
                    const baseFontSize = numWinners <= 3 ? 'text-2xl' : numWinners <= 6 ? 'text-xl' : 'text-lg';
                    const nameFontSize = getNameFontSize(studentName, baseFontSize);
                    
                                                              return (
                     <Card key={`${eventName}-${winner.house}-${winner.position}`} className="w-full h-full flex flex-col min-h-[200px]">
                       <CardContent className="p-6 flex flex-col h-full">
                         {/* Top section: Position and House */}
                         <div className="flex items-center justify-between mb-4">
                           <div className={`font-bold ${numWinners <= 3 ? 'text-5xl' : numWinners <= 6 ? 'text-4xl' : 'text-3xl'}`}>
                             {getPositionDisplay(winner.position)}
                           </div>
                           <div className={`rounded-full font-semibold ${numWinners <= 3 ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm'} ${getHouseColor(winner.house)}`}>
                             {winner.house}
                           </div>
                         </div>
                         
                         {/* Bottom section: Photo left, Name & Score right */}
                         <div className="flex items-center gap-4 flex-1">
                           {/* Winner photo */}
                           <div className={`rounded-full bg-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0 ${numWinners <= 3 ? 'w-24 h-24' : numWinners <= 6 ? 'w-20 h-20' : 'w-18 h-18'}`}>
                             <img src={winner.image ? winner.image : "/public/placeholder.svg"} alt="Winner" className="w-full h-full object-cover" />
                           </div>
                           
                           {/* Name and score */}
                           <div className="flex-1 min-w-0 flex flex-col justify-center">
                             <div className={`font-medium text-foreground leading-tight ${nameFontSize}`} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
                               {studentName}
                             </div>
                             <div className={`text-muted-foreground font-medium mt-2 ${numWinners <= 3 ? 'text-xl' : numWinners <= 6 ? 'text-lg' : 'text-base'}`}>
                               +{winner.points || 0} pts
                             </div>
                           </div>
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