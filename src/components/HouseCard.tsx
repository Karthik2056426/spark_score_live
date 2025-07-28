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

const rankEmojis = {
  1: '🥇',
  2: '🥈', 
  3: '🥉',
  4: '🏅'
};

const HouseCard: React.FC<HouseCardProps> = ({ house }) => {
  const glowClass = `shadow-[0_0_30px_hsl(var(--${house.color})_/_0.4)]`;
  const borderClass = `border-${house.color} border-2`;
  const bgClass = `bg-${house.color}/10`;
  
  return (
    <Card className={`${borderClass} ${bgClass} ${glowClass} transition-all duration-500 hover:scale-105 animate-slide-up group`}>
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="text-4xl mr-2">
            {rankEmojis[house.rank as keyof typeof rankEmojis] || '🏅'}
          </div>
          <Badge 
            variant="secondary" 
            className={`bg-${house.color}/20 text-${house.color}-foreground border-${house.color}/50`}
          >
            #{house.rank}
          </Badge>
        </div>
        
        <h3 className={`text-2xl font-bold mb-2 text-${house.color}-foreground`}>
          {house.name}
        </h3>
        
        <div className="mb-4">
          <div className={`text-5xl font-mono font-bold text-${house.color}-foreground animate-score-bounce`}>
            {house.score}
          </div>
          <p className="text-muted-foreground text-sm">TOTAL POINTS</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full bg-${house.color} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(100, (house.score / 500) * 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HouseCard;