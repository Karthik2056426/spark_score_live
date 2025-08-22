import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface GradeCardProps {
  grade: {
    name: string;
    score: number;
    rank: number;
    level: 'LKG' | 'UKG' | '1' | '2' | '3' | '4';
    section: 'A' | 'B' | 'C' | 'D' | 'E';
    fullName: string; // e.g., "LKG-A", "1-B", etc.
  };
}

const getRankEmoji = (rank: number) => {
  // Handle ties properly - same rank gets same emoji
  if (rank === 0) return '⭕'; // No rank for zero points
  switch (rank) {
    case 1: return '🥇'; // Gold for 1st place
    case 2: return '🥈'; // Silver for 2nd place  
    case 3: return '🥉'; // Bronze for 3rd place
    default: return '🏅'; // Generic medal for 4th+ place
  }
};

const getGradeColor = (level: string) => {
  // Different colors for different grade levels
  switch (level) {
    case 'LKG': return 'bg-red-100 border-red-300 text-red-800';
    case 'UKG': return 'bg-orange-100 border-orange-300 text-orange-800';
    case '1': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    case '2': return 'bg-green-100 border-green-300 text-green-800';
    case '3': return 'bg-blue-100 border-blue-300 text-blue-800';
    case '4': return 'bg-purple-100 border-purple-300 text-purple-800';
    default: return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};

const GradeCard: React.FC<GradeCardProps> = ({ grade }) => {
  const colorClass = getGradeColor(grade.level);
  
  return (
    <Card className={`${colorClass} border-2 transition-all duration-500 hover:scale-105 animate-slide-up group hover:shadow-lg`}>
      <CardContent className="p-4">
        <div className="text-center">
          {/* Rank emoji at the top center */}
          <div className="flex justify-center mb-2">
            <div className="text-2xl">
              {getRankEmoji(grade.rank)}
            </div>
          </div>
          
          <h3 className="text-lg font-bold mb-1">
            {grade.fullName}
          </h3>
          
          <Badge variant="outline" className="text-xs mb-2">
            Grade {grade.level} - Section {grade.section}
          </Badge>
          
          <div>
            <div className="text-2xl font-mono font-bold animate-score-bounce">
              {grade.score}
            </div>
            <p className="text-muted-foreground text-xs">TOTAL POINTS</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeCard;
