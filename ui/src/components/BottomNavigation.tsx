import React from 'react';
import { Button } from './ui/button';
import { 
  Home, 
  MessageCircle, 
  Heart, 
  BarChart3, 
  Settings,
  Star 
} from 'lucide-react';

const navigationItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'habits', label: 'Habits', icon: Star },
  { id: 'chat', label: 'Coach', icon: MessageCircle },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export function BottomNavigation({ currentScreen, onNavigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto">
        <div className="glass-card m-4 rounded-2xl p-5">
          <div className="flex justify-around items-center">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center space-y-1 p-6 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-glow' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Icon className={`size-5 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}