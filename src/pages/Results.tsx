import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import Header from "@/components/Header";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const Results: React.FC = () => {
  const { grades, gradesByLevel, GRADE_SECTIONS, events } = useSparkData();
  const [emblaApi, setEmblaApi] = useState<any>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showNavbar, setShowNavbar] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-advance carousel every 8 seconds (pause on hover)
  useEffect(() => {
    if (!emblaApi || !autoPlay || isHovering) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 8000);
    return () => clearInterval(interval);
  }, [emblaApi, autoPlay, isHovering]);

  // Handle mouse position for navbar visibility
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Show navbar when mouse is in top 80px of screen
      setShowNavbar(e.clientY < 80);
    };

    const handleMouseLeave = () => {
      // Hide navbar when mouse leaves the window
      setShowNavbar(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const getCategoryColor = (level: string) => {
    const colors = {
      'LKG': 'from-red-400 to-red-600',
      'UKG': 'from-orange-400 to-orange-600',
      '1': 'from-yellow-400 to-yellow-600',
      '2': 'from-green-400 to-green-600',
      '3': 'from-blue-400 to-blue-600',
      '4': 'from-purple-400 to-purple-600'
    };
    return colors[level as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  const getSectionColor = (level: string) => {
    const colors = {
      'LKG': 'border-red-600 bg-red-100 hover:bg-red-200',
      'UKG': 'border-orange-600 bg-orange-100 hover:bg-orange-200',
      '1': 'border-yellow-600 bg-yellow-100 hover:bg-yellow-200',
      '2': 'border-green-600 bg-green-100 hover:bg-green-200',
      '3': 'border-blue-600 bg-blue-100 hover:bg-blue-200',
      '4': 'border-purple-600 bg-purple-100 hover:bg-purple-200'
    };
    return colors[level as keyof typeof colors] || 'border-gray-600 bg-gray-100';
  };

  // Generate carousel slides
  const generateCarouselSlides = () => {
    const slides: JSX.Element[] = [];

    GRADE_SECTIONS.forEach((categoryData) => {
      const levelData = gradesByLevel.find(g => g.level === categoryData.level);
      if (!levelData) return;

      const sortedSections = [...levelData.grades].sort((a, b) => b.score - a.score);

      // 1. Category Overview Slide
      slides.push(
        <CarouselItem key={`${categoryData.level}-overview`}>
          <div className="p-6 space-y-6">
            {/* Category Header */}
            <div className="text-center">
              <h2 className="text-4xl font-bold text-foreground mb-2">
                Grade {categoryData.level} Overview
              </h2>
              <p className="text-muted-foreground">
                {categoryData.sections.length} sections • {sortedSections.filter(s => s.score > 0).length} active
              </p>
            </div>

            {/* Champion Highlight */}
            {levelData.champion && (
              <Card className={`border-2 bg-gradient-to-r ${getCategoryColor(categoryData.level)} text-white`}>
                <CardContent className="p-6 text-center">
                  <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <h3 className="text-2xl font-bold mb-1">Category Champion</h3>
                  <p className="text-xl opacity-90 mb-2">{levelData.champion.fullName}</p>
                  <div className="text-3xl font-bold">{levelData.champion.score} points</div>
                </CardContent>
              </Card>
            )}

            {/* Sections Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sortedSections.map((section, index) => (
                <Card 
                  key={section.fullName}
                  className={`border-2 bg-gradient-to-r ${getCategoryColor(categoryData.level)} text-white transition-all duration-300 hover:scale-105`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">
                      {section.score === 0 ? '⭕' : 
                       section.rank === 1 ? '🥇' : 
                       section.rank === 2 ? '🥈' : 
                       section.rank === 3 ? '🥉' : 
                       `#${section.rank}`}
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {section.fullName}
                    </h4>
                    <div className="text-2xl font-bold text-white">
                      {section.score}
                    </div>
                    <p className="text-sm opacity-90">points</p>
                    {section.score > 0 && (
                      <Badge variant="outline" className="mt-2 text-xs border-white text-white bg-white/20">
                        Rank {section.rank}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CarouselItem>
      );

      // 2. Individual Section Detail Slides
      sortedSections.forEach((section) => {
        const sectionEvents = events
          .filter(event => event.hasResults && event.winners)
          .flatMap(event => 
            event.winners!
              .filter(winner => winner.gradeSection === section.fullName)
              .map(winner => ({
                ...winner,
                eventName: event.name,
                eventCategory: event.category,
                eventType: event.type
              }))
          )
          .sort((a, b) => b.points - a.points);

        slides.push(
          <CarouselItem key={`${section.fullName}-details`}>
            <div className="p-6 space-y-6">
              {/* Section Summary with Heading on Left */}
              <Card className={`border-2 bg-gradient-to-r ${getCategoryColor(categoryData.level)} text-white`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-8">
                    {/* Left Side - Section Info */}
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold mb-2">
                        {section.fullName} Details
                      </h2>
                      <p className="text-lg opacity-90">
                        Rank #{section.rank > 0 ? section.rank : 'Unranked'} in Grade {categoryData.level}
                      </p>
                    </div>
                    
                    {/* Right Side - Stats */}
                    <div className="grid grid-cols-3 gap-8 text-center">
                      <div className="space-y-2">
                        <Trophy className="h-6 w-6 mx-auto text-yellow-300" />
                        <div className="text-xl font-bold">{section.score}</div>
                        <p className="text-sm opacity-90">Total Points</p>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xl">
                          {section.rank === 1 ? '🥇' : 
                           section.rank === 2 ? '🥈' : 
                           section.rank === 3 ? '🥉' : 
                           section.rank > 0 ? `#${section.rank}` : '⭕'}
                        </div>
                        <div className="text-xl font-bold">
                          {section.rank > 0 ? `${section.rank}` : 'N/A'}
                        </div>
                        <p className="text-sm opacity-90">Rank</p>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xl font-bold">{sectionEvents.length}</div>
                        <div className="text-xl font-bold">Events</div>
                        <p className="text-sm opacity-90">Won</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Events Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Events & Points Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sectionEvents.length > 0 ? (
                    <div className="space-y-3">
                      {sectionEvents.map((event, index) => (
                        <div 
                          key={`${event.eventName}-${event.position}`}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/20 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-xl">
                              {event.position === 1 ? '🥇' : 
                               event.position === 2 ? '🥈' : 
                               event.position === 3 ? '🥉' : '🏅'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">{event.eventName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {event.eventType} • {event.eventCategory}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={
                              event.position === 1 ? 'bg-yellow-500 text-black' :
                              event.position === 2 ? 'bg-gray-400 text-black' :
                              event.position === 3 ? 'bg-orange-500 text-white' :
                              'bg-blue-500 text-white'
                            }>
                              {event.position === 1 ? '1st' : 
                               event.position === 2 ? '2nd' : 
                               event.position === 3 ? '3rd' : 
                               `${event.position}th`}
                            </Badge>
                            <div className="text-lg font-bold text-foreground mt-1">
                              +{event.points} pts
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Total Row */}
                      <div className="border-t pt-3 mt-4">
                        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                          <div className="font-bold text-lg">Total Points</div>
                          <div className="text-2xl font-bold text-primary">
                            {section.score} pts
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-foreground mb-2">No Events Won</h4>
                      <p className="text-muted-foreground">This section hasn't won any events yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        );
      });
    });

    return slides;
  };

  const carouselSlides = generateCarouselSlides();

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden Header that shows on hover */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <Header />
      </div>
      
      {/* Hover trigger area */}
      <div 
        className="fixed top-0 left-0 right-0 h-20 z-40"
        onMouseEnter={() => setShowNavbar(true)}
      />
      
      <div className="container mx-auto px-4 py-8">


        {/* Carousel */}
        <div className="max-w-6xl mx-auto">
          <Carousel 
            className="w-full" 
            opts={{ loop: true }} 
            setApi={setEmblaApi}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <CarouselContent>
              {carouselSlides}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-6 space-x-2 flex-wrap">
            {carouselSlides.slice(0, 20).map((_, index) => (
              <button
                key={index}
                className="w-2 h-2 rounded-full bg-muted hover:bg-primary transition-colors"
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
            {carouselSlides.length > 20 && (
              <span className="text-muted-foreground text-sm">
                +{carouselSlides.length - 20} more
              </span>
            )}
          </div>

          {/* Stats Summary */}
          <div className="text-center mt-8 pt-6 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div>
                <div className="text-2xl font-bold text-foreground">{GRADE_SECTIONS.length}</div>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {GRADE_SECTIONS.reduce((sum, cat) => sum + cat.sections.length, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Sections</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {grades.filter(g => g.score > 0).length}
                </div>
                <p className="text-sm text-muted-foreground">Active Sections</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {events.filter(e => e.hasResults).length}
                </div>
                <p className="text-sm text-muted-foreground">Events Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;