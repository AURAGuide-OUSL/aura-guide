import React from 'react';
import { Sparkles, Star } from 'lucide-react';
import appLogo from 'figma:asset/789eba7287f5e12d2f1dbbe4ed4a5f02ee010c4d.png';
import image_5ed9a854d192b90f470926ea2e77e166d6a27d5c from 'figma:asset/5ed9a854d192b90f470926ea2e77e166d6a27d5c.png';

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-600 via-slate-600 to-ash-700 text-white px-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-blue-300/20 rounded-full blur-lg animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-ash-300/30 rounded-full blur-md animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 mb-8">
        <div className="relative p-8 glass-card rounded-3xl animate-pulse shadow-glow">
          <img 
            src={image_5ed9a854d192b90f470926ea2e77e166d6a27d5c} 
            alt="LifePath AI Logo" 
            className="size-20 object-contain" 
          />
          <Sparkles className="absolute -top-3 -right-3 size-8 text-blue-300 animate-bounce" />
          <Star className="absolute -bottom-2 -left-2 size-6 text-ash-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="absolute inset-0 bg-blue-400/10 rounded-3xl blur-2xl animate-ping"></div>
      </div>
      
      <div className="text-center space-y-6 relative z-10">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-200 to-ash-200 bg-clip-text text-transparent">
            AURA Guide
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-400 via-slate-400 to-ash-400 rounded-full mx-auto animate-pulse"></div>
        </div>
        
        <p className="text-xl opacity-90 max-w-xs leading-relaxed">
          Your intelligent companion for achieving life goals
        </p>
        
        <div className="flex justify-center space-x-1 mt-8">
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-300/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-ash-300/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <div className="mt-8 text-sm opacity-75">
          <p>✨ Powered by Gemini CLI</p>
          {/* <p>✨ Powered by Gemini CLI • 🎯 Goal-Driven • 📈 Life-Changing</p> */}
        </div>
      </div>
    </div>
  );
}