import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Calendar, Users, Filter } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import Header from "@/components/Header";

const Results: React.FC = () => {
  const { events, eventTemplates } = useSparkData();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Merge events and templates by event name (show event result if exists, else template)
  const eventMap = new Map();
  events.forEach(event => {
    eventMap.set(event.name, { ...event, isResult: true });
  });
  eventTemplates.forEach(template => {
    if (!eventMap.has(template.name)) {
      eventMap.set(template.name, { ...template, isResult: false });
    }
  });
  const mergedEvents = Array.from(eventMap.values());

  const filteredEvents = mergedEvents.filter(event => {
    const categoryMatch = filterCategory === 'all' || event.category === filterCategory;
    const typeMatch = filterType === 'all' || event.type === filterType;
    return categoryMatch && typeMatch;
  });

  const getPositionBadge = (position: number) => {
    const variants = {
      1: 'bg-gradient-gold text-black',
      2: 'bg-gradient-silver text-black', 
      3: 'bg-gradient-bronze text-white',
    };
    return variants[position as keyof typeof variants] || 'bg-muted text-muted-foreground';
  };

  const getHouseColor = (house: string) => {
    const colors = {
      'Tagore': 'tagore',
      'Delany': 'delany', 
      'Gandhi': 'gandhi',
      'Nehru': 'nehru'
    };
    return colors[house as keyof typeof colors] || 'primary';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Event Results</h1>
          <p className="text-muted-foreground">Complete results from SPARK - The Patrician Pulse</p>
        </div>
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Grade Category</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Junior">Junior (1-5)</SelectItem>
                    <SelectItem value="Middle">Middle (6-8)</SelectItem>
                    <SelectItem value="Senior">Senior (9-12)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Event Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterType('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Results Grid */}
        <div className="grid gap-4">
          {filteredEvents.map((event, index) => (
            <Card 
              key={event.id || event.name} 
              className="hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <h3 className="text-xl font-semibold text-foreground">{event.name}</h3>
                      {event.isResult ? (
                        <Badge className={getPositionBadge(event.position)}>
                          {event.position === 1 ? '🥇 1st' : 
                           event.position === 2 ? '🥈 2nd' : 
                           event.position === 3 ? '🥉 3rd' : 
                           `#${event.position}`}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        {event.isResult && event.date ? (
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        ) : event.time ? (
                          <span>Time: {event.time}</span>
                        ) : null}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{event.category} • {event.type}</span>
                      </div>
                      {!event.isResult && event.venue && (
                        <div className="flex items-center space-x-1">
                          <span>Venue: {event.venue}</span>
                        </div>
                      )}
                    </div>
                    {!event.isResult && event.description && (
                      <div className="text-sm text-muted-foreground mt-2">{event.description}</div>
                    )}
                  </div>
                  {event.isResult ? (
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`border-${getHouseColor(event.house)} text-${getHouseColor(event.house)}-foreground bg-${getHouseColor(event.house)}/10`}
                        >
                          {event.house}
                        </Badge>
                        <div className="text-lg font-bold text-foreground mt-1">
                          +{event.points} pts
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredEvents.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Results Found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Results;