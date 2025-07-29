import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface HouseCardProps {
  house: {
    name: string;
    score: number;
    rank: number;
    color: 'tagore' | 'delany' | 'gandhi' | 'nehru';
  };
}

const getRankEmoji = (rank: number) => {
  // Handle ties properly - same rank gets same emoji
  switch (rank) {
    case 1: return '🥇'; // Gold for 1st place
    case 2: return '🥈'; // Silver for 2nd place  
    case 3: return '🥉'; // Bronze for 3rd place
    default: return '🏅'; // Generic medal for 4th+ place
  }
};

const HouseCard: React.FC<HouseCardProps> = ({ house }) => {
  const glowClass = `shadow-[0_0_30px_hsl(var(--${house.color})_/_0.4)]`;
  const borderClass = `border-${house.color} border-2`;
  const bgClass = `bg-${house.color}/10`;
  
  return (
    <Card className={`${borderClass} ${bgClass} ${glowClass} transition-all duration-500 hover:scale-105 animate-slide-up group`}>
      <CardContent className="p-4">
        <div className="text-center">
          {/* Rank emoji at the top center */}
          <div className="flex justify-center mb-2">
            <div className="text-2xl">
              {getRankEmoji(house.rank)}
            </div>
                    </div>
          
          <h3 className={`text-lg font-bold mb-2 text-${house.color}-foreground`}>
            {house.name}
          </h3>
          
          <div>
            <div className={`text-3xl font-mono font-bold text-${house.color}-foreground animate-score-bounce`}>
              {house.score}
            </div>
            <p className="text-muted-foreground text-xs">TOTAL POINTS</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HouseCard;