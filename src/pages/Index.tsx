import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSparkData } from "@/hooks/useSparkData";
import HouseCard from "@/components/HouseCard";
import Header from "@/components/Header";
import WinnersCarousel from "@/components/WinnersCarousel";

const Index = () => {
  const navigate = useNavigate();
  const { houses, events, winners } = useSparkData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-primary py-16 px-4 overflow-hidden">
        {/* Rainbow animated border at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-rainbow bg-[length:200%_100%] animate-rainbow"></div>
        
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/IMG_20250728_102056_264 (1).png" 
              alt="St. Patrick's School" 
              className="w-20 h-20 mr-4 drop-shadow-lg"
            />
            <div>
              <h1 className="text-6xl font-bold text-foreground mb-2">SPARKLE</h1>

            </div>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Live scoring and results for our annual cultural fest. Watch houses compete in real-time!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/results')} className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300">
              <Trophy className="h-5 w-5" />
              <span>View All Results</span>
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/winners')} className="flex items-center space-x-2 border-primary/50 hover:bg-primary/10 transition-all duration-300">
              <Users className="h-5 w-5" />
              <span>Winners Gallery</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Live Scoreboards */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Live House Standings</h2>
            <p className="text-muted-foreground">Real-time rankings from all SPARKLE events</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {houses.map((house, index) => (
              <div key={house.name} style={{ animationDelay: `${index * 0.2}s` }}>
                <HouseCard house={house} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Winners Carousel */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Winner</h2>
            <p className="text-muted-foreground">Celebrating our champions - rotating every 10 seconds</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <WinnersCarousel />
          </div>
        </div>
      </section>

      {/* Recent Winners */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Recent Winners</h2>
            <p className="text-muted-foreground">Celebrating our latest champions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {winners.slice(0, 3).map((winner, index) => {
              const getHouseColor = (houseName: string) => {
                switch (houseName.toLowerCase()) {
                  case 'tagore': return 'border-tagore bg-tagore/10 hover:bg-tagore/20';
                  case 'delany': return 'border-delany bg-delany/10 hover:bg-delany/20';
                  case 'gandhi': return 'border-gandhi bg-gandhi/10 hover:bg-gandhi/20';
                  case 'aloysius': return 'border-aloysius bg-aloysius/10 hover:bg-aloysius/20';
                  default: return 'border-border bg-secondary/10 hover:bg-secondary/20';
                }
              };

              return (
                <Card 
                  key={winner.id} 
                  className={`hover:shadow-xl hover:scale-105 transition-all duration-500 animate-slide-up border-2 ${getHouseColor(winner.house)} cursor-pointer group`} 
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate('/winners')}
                >
                  <CardContent className="p-6 text-center">
                    {/* Winner Photo */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {winner.image ? (
                        <img 
                          src={winner.image} 
                          alt={winner.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Trophy className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{winner.name}</h3>
                    <p className="text-muted-foreground mb-3">{winner.event}</p>
                    <Badge variant="outline" className={`${getHouseColor(winner.house)} border-current transition-all duration-300`}>
                      {winner.house} House
                    </Badge>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {winner.position === 1 ? '🥇 First Place' : 
                       winner.position === 2 ? '🥈 Second Place' : 
                       winner.position === 3 ? '🥉 Third Place' : 
                       `#${winner.position}`}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <Card className="bg-gradient-primary cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-500 border border-primary/20" onClick={() => navigate('/events')}>
              <CardContent className="p-8">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-3xl font-bold text-foreground mb-2">{events.length}</div>
                <p className="text-muted-foreground">Total Events</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-primary cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-500 border border-primary/20" onClick={() => navigate('/winners')}>
              <CardContent className="p-8">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-3xl font-bold text-foreground mb-2">{events.length}</div>
                <p className="text-muted-foreground">Winners Declared</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary/5 py-8 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/IMG_20250728_102056_264 (1).png" 
              alt="St. Patrick's School" 
              className="w-8 h-8 mr-2"
            />
            <span className="text-xl font-bold text-foreground">SPARKLE</span>
          </div>
          <p className="text-muted-foreground">Celebrating excellence, fostering competition, building character.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
