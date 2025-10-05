import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ThemeToggleProps {
  variant?: 'button' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'switch', 
  size = 'md',
  className = '' 
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to dark mode if no preference
    return true;
  });
  
  useEffect(() => {
    // Apply the theme to the document when it changes
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 20;
      default: return 16;
    }
  };

  if (variant === 'button') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`p-2 hover:bg-accent hover:text-accent-foreground ${className}`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <Sun size={getIconSize()} className="text-yellow-500" />
        ) : (
          <Moon size={getIconSize()} className="text-slate-600" />
        )}
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Moon 
        size={getIconSize()} 
        className={`${isDarkMode ? 'text-primary' : 'text-muted-foreground'} transition-colors`} 
      />
      <Switch 
        checked={!isDarkMode} 
        onCheckedChange={toggleTheme} 
        className="data-[state=checked]:bg-primary"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      />
      <Sun 
        size={getIconSize()} 
        className={`${!isDarkMode ? 'text-primary' : 'text-muted-foreground'} transition-colors`} 
      />
    </div>
  );
};

export default ThemeToggle;