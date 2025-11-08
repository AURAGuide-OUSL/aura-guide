import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Target, MessageCircle, Heart, Calendar, TrendingUp, Star } from 'lucide-react';

const onboardingSteps = [
  {
    icon: Target,
    title: "Set Your Life Goals",
    description: "Tell us your biggest dreams and we'll break them down into achievable milestones",
    color: "text-blue-500"
  },
  {
    icon: MessageCircle,
    title: "Chat with Your AI Coach",
    description: "Get personalized advice, motivation, and planning support through natural conversation",
    color: "text-green-500"
  },
  {
    icon: Heart,
    title: "Track Your Wellbeing",
    description: "Monitor your mood and emotional state. We'll adapt our approach to support you better",
    color: "text-red-500"
  },
  {
    icon: Calendar,
    title: "Smart Daily Planning",
    description: "Receive adaptive daily and weekly plans that fit your schedule and productivity patterns",
    color: "text-purple-500"
  },
  {
    icon: TrendingUp,
    title: "See Your Progress",
    description: "Visualize how your daily actions are building toward your long-term goals",
    color: "text-orange-500"
  }
];

export function OnboardingScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <div className="flex justify-between items-center p-4">
        <div className="flex space-x-1">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <Button variant="ghost" onClick={handleSkip}>
          Skip
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <Card className="w-full max-w-sm">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div className={`p-6 bg-card rounded-full border-2 inline-block ${step.color}`}>
                <Icon className="size-12text-[#04297A]" />
              </div>
              <Star className="absolute -top-2 -right-2 size-6 text-yellow-500" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl tracking-tight">{step.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 space-y-3">
        <Button onClick={handleNext} className="w-full h-12 bg-[rgba(4,41,122,1)]" size="lg">
          {currentStep === onboardingSteps.length - 1 ? "Let's Get Started!" : "Next"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Step {currentStep + 1} of {onboardingSteps.length}
        </p>
      </div>
    </div>
  );
}