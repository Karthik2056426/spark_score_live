import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";

const WinnersCarousel: React.FC = () => {
  const { winners, grades } = useSparkData();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (winners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % winners.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [winners.length]);

  if (winners.length === 0) {
    return (
      <Card className="bg-gradient-primary border-border/50">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No winners to display</p>
        </CardContent>
      </Card>
    );
  }

  const currentWinner = winners[currentIndex];
  const grade = grades.find(g => g.fullName === currentWinner.gradeSection);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getGradeColor = (gradeSection: string) => {
    const level = gradeSection?.split('-')[0];
    switch (level?.toLowerCase()) {
      case 'lkg': return 'border-red-300 bg-red-50';
      case 'ukg': return 'border-orange-300 bg-orange-50';
      case '1': return 'border-yellow-300 bg-yellow-50';
      case '2': return 'border-green-300 bg-green-50';
      case '3': return 'border-blue-300 bg-blue-50';
      case '4': return 'border-purple-300 bg-purple-50';
      default: return 'border-border bg-secondary/10';
    }
  };

  return (
    <Card className={`transition-all duration-1000 ease-in-out border-2 ${getGradeColor(currentWinner.gradeSection)} hover:shadow-lg`}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Winner Photo */}
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-secondary/20 flex items-center justify-center">
            {currentWinner.image ? (
              <img 
                src={currentWinner.image} 
                alt={currentWinner.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Trophy className="h-10 w-10 text-muted-foreground" />
            )}
          </div>

          {/* Position & Winner Details */}
          <div className="space-y-2">
            <div className="text-3xl">{getPositionIcon(currentWinner.position)}</div>
            <h3 className="text-lg font-bold text-foreground">{currentWinner.name}</h3>
            <p className="text-sm text-muted-foreground font-medium">{currentWinner.event}</p>
            
            <Badge 
              variant="outline" 
              className={`${getGradeColor(currentWinner.gradeSection)} border-current`}
            >
              Grade {currentWinner.gradeSection}
            </Badge>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center space-x-1 pt-2">
            {winners.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WinnersCarousel;