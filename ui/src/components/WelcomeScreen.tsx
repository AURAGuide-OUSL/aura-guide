import image_5ed9a854d192b90f470926ea2e77e166d6a27d5c from 'figma:asset/5ed9a854d192b90f470926ea2e77e166d6a27d5c.png';
import image_838c044fedd71b378bfe36de72ae9695e484f8f8 from 'figma:asset/838c044fedd71b378bfe36de72ae9695e484f8f8.png';
import React from 'react';
import { Button } from './ui/button';
import { Star, Heart, TrendingUp } from 'lucide-react';
import appLogo from 'figma:asset/789eba7287f5e12d2f1dbbe4ed4a5f02ee010c4d.png';

export function WelcomeScreen({ onNavigate }) {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="relative mb-8">
          <div className="p-4 bg-blue-100 rounded-full">
            <img 
              src={image_5ed9a854d192b90f470926ea2e77e166d6a27d5c} 
              alt="LifePath AI Logo" 
              className="size-20 object-contain mx-auto" 
            />
          </div>
          <Star className="absolute -top-2 -right-2 size-6 text-blue-500" />
        </div>
        
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl tracking-tight text-slate-800">Welcome to AURA Guide</h1>
          <p className="text-slate-600 text-lg max-w-sm">
            Transform your dreams into achievable milestones with your AI-powered life coach
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
          <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
            <TrendingUp className="size-8 text-[#04297A] mb-2" />
            <span className="text-sm text-center text-slate-700">Smart Goal Planning</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Heart className="size-8 text-[#04297A] mb-2" />
            <span className="text-sm text-center text-slate-700">Emotional Support</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-3">
        <Button 
          onClick={() => onNavigate('auth')} 
          className="w-full h-12 bg-[rgba(4,41,122,1)] hover:bg-blue-700"
          size="lg"
        >
          Get Started
        </Button>
        <Button 
          onClick={() => onNavigate('auth', { mode: 'login' })} 
          variant="outline" 
          className="w-full h-12 border-slate-300 text-slate-700 hover:bg-slate-50"
          size="lg"
        >
          I Already Have an Account
        </Button>
      </div>
    </div>
  );
}