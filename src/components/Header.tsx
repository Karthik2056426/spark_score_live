import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Settings, Home, Search, Calendar, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/results?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  
  return (
    <header className="bg-gradient-primary border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/db2da13b-681b-48c0-b1ee-e2995b83c8d0.png" 
              alt="St. Patrick's School Mananthavady" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">SPARK</h1>
              <p className="text-xs text-muted-foreground">The Patrician Pulse</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50 focus:bg-secondary/80 transition-colors"
              />
            </div>
          </form>

          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            
            <Button
              variant={location.pathname === '/results' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/results')}
              className="flex items-center space-x-2"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </Button>

            <Button
              variant={location.pathname === '/events' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/events')}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </Button>

            <Button
              variant={location.pathname === '/winners' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/winners')}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Winners</span>
            </Button>
            
            <Button
              variant={location.pathname === '/admin' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;