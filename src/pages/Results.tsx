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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLegend, setShowLegend] = useState(false);

  // Auto-advance carousel every 8 seconds
  useEffect(() => {
    if (!emblaApi || !autoPlay) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 8000);
    return () => clearInterval(interval);
  }, [emblaApi, autoPlay]);

  // Track current slide and show legend only on matrix table slides
  useEffect(() => {
    if (!emblaApi) return;

    const updateSlide = () => {
      const slideIndex = emblaApi.selectedScrollSnap();
      setCurrentSlide(slideIndex);
      
      // Calculate total slides per category (1 overview + N event details + 1 matrix)
      const slidesPerCategory = 1 + events.filter(e => e.hasResults && e.winners).length + 1;
      const categoryIndex = Math.floor(slideIndex / slidesPerCategory);
      const slideWithinCategory = slideIndex % slidesPerCategory;
      
      // Show legend only on matrix table slides (last slide of each category)
      const isMatrixSlide = slideWithinCategory === slidesPerCategory - 1;
      setShowLegend(isMatrixSlide);
    };

    emblaApi.on('select', updateSlide);
    updateSlide(); // Initial call

    return () => {
      emblaApi.off('select', updateSlide);
    };
  }, [emblaApi]);

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
                Grade {categoryData.level}
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
                    <h4 className="text-lg font-bold text-white mb-1">
                      {section.fullName}
                    </h4>
                    <div className="text-2xl font-bold text-white">
                      {section.score}
                    </div>
                    <p className="text-sm opacity-90">points</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CarouselItem>
      );

      // 2. Individual Event Detail Slides
      const categoryEvents = events.filter(event => 
        event.hasResults && 
        event.winners && 
        event.category === categoryData.level
      );

      categoryEvents.forEach((event) => {
        if (event.winners && event.winners.length > 0) {
          const eventWinners = event.winners
            .filter(winner => winner.gradeSection?.startsWith(categoryData.level))
            .sort((a, b) => a.position - b.position);

          slides.push(
            <CarouselItem key={`${event.id}-winners`}>
              <div className="px-2 sm:px-4 pt-3 pb-6 space-y-4 h-screen flex flex-col">
                {/* Event Header */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-foreground mb-1">
                    {event.name}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Grade {categoryData.level} • {event.type}
                  </p>
                </div>

                {/* Winners Grid */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-6xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                      {eventWinners.map((winner, index) => (
                        <Card key={`${winner.gradeSection}-${winner.position}`} className="border-2 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-4 text-center">
                            {/* Winner Photo */}
                            {winner.image ? (
                              <div className="flex justify-center mb-3">
                                <img
                                  src={winner.image}
                                  alt={winner.studentName}
                                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                />
                              </div>
                            ) : (
                              <div className="flex justify-center mb-3">
                                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                                  <span className="text-2xl text-gray-400">👤</span>
                                </div>
                              </div>
                            )}

                            {/* Winner Info */}
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {winner.studentName || 'Winner'}
                            </h3>
                            
                            <div className="space-y-1">
                              <Badge className={`${
                                categoryData.level === 'LKG' ? 'bg-red-500' :
                                categoryData.level === 'UKG' ? 'bg-orange-500' :
                                categoryData.level === '1' ? 'bg-yellow-500' :
                                categoryData.level === '2' ? 'bg-green-500' :
                                categoryData.level === '3' ? 'bg-blue-500' :
                                categoryData.level === '4' ? 'bg-purple-500' :
                                'bg-gray-500'
                              } text-white`}>
                                {winner.gradeSection}
                              </Badge>
                              
                              <div className="text-sm text-muted-foreground">
                                {winner.position === 1 ? '1st Place' :
                                 winner.position === 2 ? '2nd Place' :
                                 winner.position === 3 ? '3rd Place' :
                                 `${winner.position}th Place`}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          );
        }
      });

      // 3. Event-Section Matrix Table
      if (categoryEvents.length > 0) {
        slides.push(
          <CarouselItem key={`${categoryData.level}-matrix`}>
            <div className="px-2 sm:px-4 pt-3 pb-6 space-y-3 h-screen flex flex-col">
              {/* Category Header */}
              <div className="text-center">
                <h2 className="text-4xl font-bold text-foreground mb-2">
                  Grade {categoryData.level}
                </h2>
              </div>


              {/* Event-Section Matrix Table */}
              <Card className="flex-1 min-h-0">
                <CardContent className="p-0 h-full">
                  <div className="overflow-auto h-full">
                    <table className="w-full border-collapse table-fixed text-xs sm:text-sm">
                      {/* Header Row */}
                      <thead>
                        <tr className="bg-secondary/20">
                          <th className="text-left p-2 sm:p-3 border font-semibold" style={{width: '25%'}}>
                            <div className="truncate">Events</div>
                          </th>
                          {categoryData.sections.map(section => {
                            const sectionData = sortedSections.find(s => s.section === section);
                            const isTopScore = sectionData && levelData.champion && sectionData.fullName === levelData.champion.fullName;
                            
                            return (
                              <th 
                                key={section} 
                                className={`text-center p-1 sm:p-2 border font-semibold ${
                                  isTopScore ? 'bg-yellow-400 text-black' : ''
                                }`}
                                style={{width: `${75/categoryData.sections.length}%`}}
                              >
                                <div>
                                  <div className="font-bold text-xs sm:text-sm">
                                    {categoryData.level}-{section}
                                  </div>
                                  <div className={`text-xs font-semibold mt-0.5 ${
                                    isTopScore ? 'text-black' : 'text-muted-foreground'
                                  }`}>
                                    {sectionData ? `${sectionData.score}` : '0'}
                                  </div>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      
                      {/* Event Rows */}
                      <tbody>
                        {categoryEvents.map((event, eventIdx) => (
                          <tr key={event.id} className={eventIdx % 2 === 0 ? 'bg-background' : 'bg-secondary/10'}>
                            {/* Event Name Column */}
                            <td className="p-1 sm:p-2 border font-medium">
                              <div className="truncate">
                                <div className="font-semibold text-foreground truncate text-xs sm:text-sm" title={event.name}>
                                  {event.name}
                                </div>
                              </div>
                            </td>
                            
                            {/* Section Position Columns */}
                            {categoryData.sections.map(section => {
                              const sectionFullName = `${categoryData.level}-${section}`;
                              const sectionWinners = event.winners?.filter(
                                winner => winner.gradeSection === sectionFullName
                              ) || [];
                              
                              return (
                                <td key={section} className="p-1 border text-center">
                                  {sectionWinners.length > 0 ? (
                                    <div className="space-y-0.5">
                                      {sectionWinners
                                        .sort((a, b) => a.position - b.position)
                                        .map((winner, idx) => (
                                          <div 
                                            key={idx}
                                            className={`inline-block px-1 py-0.5 rounded text-xs font-bold mr-0.5 ${
                                              winner.position === 1 ? 'bg-yellow-500 text-white' :
                                              winner.position === 2 ? 'bg-gray-400 text-white' :
                                              winner.position === 3 ? 'bg-orange-600 text-white' :
                                              'bg-blue-500 text-white'
                                            }`}
                                          >
                                            {winner.position === 1 ? '🥇' :
                                             winner.position === 2 ? '🥈' :
                                             winner.position === 3 ? '🥉' :
                                             winner.position}
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{categoryEvents.length}</div>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{categoryData.sections.length}</div>
                    <p className="text-sm text-muted-foreground">Sections</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {sortedSections.filter(s => s.score > 0).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Sections</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {levelData.champion ? levelData.champion.score : 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Top Score</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CarouselItem>
        );
      }
    });

    return slides;
  };

  const carouselSlides = generateCarouselSlides();

  return (
    <div className="min-h-screen bg-background">
      {/* Points Legend - Fixed to viewport - Only show on matrix table slides */}
      {showLegend && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 border border-gray-600 rounded-lg p-2 shadow-lg transition-opacity duration-300">
          <div className="text-xs font-semibold mb-1 text-center text-white">Points Legend</div>
          <div className="flex gap-4 text-xs">
          {/* Individual Events */}
          <div className="flex flex-col gap-1">
            <div className="font-medium text-gray-300 text-center">Individual</div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <span className="inline-block px-1 py-0.5 rounded text-xs font-bold bg-yellow-500 text-white">🥇</span>
                <span className="text-white">7</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block px-1 py-0.5 rounded text-xs font-bold bg-gray-400 text-white">🥈</span>
                <span className="text-white">5</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block px-1 py-0.5 rounded text-xs font-bold bg-orange-600 text-white">🥉</span>
                <span className="text-white">3</span>
              </div>
            </div>
          </div>
          
          {/* Group Events */}
          <div className="flex flex-col gap-1 border-l border-gray-600 pl-4">
            <div className="font-medium text-gray-300 text-center">Group</div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <span className="inline-block px-1 py-0.5 rounded text-xs font-bold bg-yellow-500 text-white">🥇</span>
                <span className="text-white">15</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block px-1 py-0.5 rounded text-xs font-bold bg-gray-400 text-white">🥈</span>
                <span className="text-white">12</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block px-1 py-0.5 rounded text-xs font-bold bg-orange-600 text-white">🥉</span>
                <span className="text-white">10</span>
                    </div>
                      </div>
                    </div>
                        </div>
                      </div>
      )}

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