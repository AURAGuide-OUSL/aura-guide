import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";
import {
  ArrowLeft,
  Heart,
  Battery,
  Brain,
  Zap,
  TrendingUp,
  Sparkles
} from "lucide-react";

const moodOptions = [
  {
    id: "amazing",
    label: "Amazing",
    emoji: "🤩",
    color: "from-green-400 to-green-600",
    value: 5,
  },
  {
    id: "happy",
    label: "Happy",
    emoji: "😊",
    color: "from-blue-400 to-blue-600",
    value: 4,
  },
  {
    id: "okay",
    label: "Okay",
    emoji: "😐",
    color: "from-yellow-400 to-yellow-600",
    value: 3,
  },
  {
    id: "sad",
    label: "Sad",
    emoji: "😔",
    color: "from-orange-400 to-orange-600",
    value: 2,
  },
  {
    id: "stressed",
    label: "Stressed",
    emoji: "😰",
    color: "from-red-400 to-red-600",
    value: 1,
  },
];

const factors = [
  { id: "sleep", label: "Good Sleep", icon: "😴" },
  { id: "exercise", label: "Exercise", icon: "💪" },
  { id: "social", label: "Social Time", icon: "👥" },
  { id: "work", label: "Productive Work", icon: "✅" },
  { id: "food", label: "Healthy Meals", icon: "🥗" },
  { id: "nature", label: "Time Outside", icon: "🌳" },
  { id: "creative", label: "Creative Time", icon: "🎨" },
  { id: "relax", label: "Relaxation", icon: "🧘" },
];

interface MoodCheckScreenProps {
  onLogMood: (data: any) => void;
  onNavigate: (screen: string) => void;
}

export function MoodCheckScreen({ onLogMood, onNavigate }: MoodCheckScreenProps) {
  const [step, setStep] = useState(1);
  const [moodData, setMoodData] = useState({
    mood: "",
    moodValue: 0,
    energy: 50,
    stress: 50,
    motivation: 50,
    factors: [] as string[],
    notes: "",
  });

  const handleMoodSelect = (mood: typeof moodOptions[0]) => {
    setMoodData({ ...moodData, mood: mood.id, moodValue: mood.value });
    setTimeout(() => setStep(2), 300);
  };

  const toggleFactor = (factorId: string) => {
    setMoodData({
      ...moodData,
      factors: moodData.factors.includes(factorId)
        ? moodData.factors.filter((f) => f !== factorId)
        : [...moodData.factors, factorId],
    });
  };

  const handleSubmit = () => {
    const finalData = {
      ...moodData,
      timestamp: new Date(),
    };
    onLogMood(finalData);
    onNavigate("dashboard");
  };

  const getSliderColor = (value: number) => {
    if (value >= 75) return "from-green-500 to-green-600";
    if (value >= 50) return "from-blue-500 to-blue-600";
    if (value >= 25) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  const selectedMoodData = moodOptions.find((m) => m.id === moodData.mood);

  return (
    <div className="h-screen bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-background sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (step > 1 ? setStep(step - 1) : onNavigate("dashboard"))}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 text-center">
          <h1 className="font-semibold">Mood Check-in</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress Indicator */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {step} of 4</span>
          <span className="text-sm font-medium text-primary">
            {Math.round((step / 4) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-4 pb-6">
        {/* Step 1: Select Mood */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="size-5 text-red-500" />
                <span>How are you feeling right now?</span>
              </CardTitle>
              <CardDescription>
                Choose the emotion that best describes your current state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      moodData.mood === mood.id
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${mood.color} flex items-center justify-center text-2xl shadow-sm`}>
                        {mood.emoji}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold">{mood.label}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          {[...Array(mood.value)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full bg-gradient-to-r ${mood.color}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Energy, Stress & Motivation */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Battery className="size-5 text-primary" />
                <span>Your Energy & Stress</span>
              </CardTitle>
              <CardDescription>
                Help us understand your current state better
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Energy Level */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Battery className="size-4 text-primary" />
                    <span className="text-sm font-medium">Energy Level</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r ${getSliderColor(moodData.energy)}`}>
                    {moodData.energy}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={moodData.energy}
                  onChange={(e) =>
                    setMoodData({ ...moodData, energy: parseInt(e.target.value) })
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${moodData.energy}%, hsl(var(--secondary)) ${moodData.energy}%, hsl(var(--secondary)) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* Stress Level */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="size-4 text-primary" />
                    <span className="text-sm font-medium">Stress Level</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r ${getSliderColor(100 - moodData.stress)}`}>
                    {moodData.stress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={moodData.stress}
                  onChange={(e) =>
                    setMoodData({ ...moodData, stress: parseInt(e.target.value) })
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(239, 68, 68) 0%, rgb(239, 68, 68) ${moodData.stress}%, hsl(var(--secondary)) ${moodData.stress}%, hsl(var(--secondary)) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Relaxed</span>
                  <span>Very Stressed</span>
                </div>
              </div>

              {/* Motivation Level */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="size-4 text-primary" />
                    <span className="text-sm font-medium">Motivation</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r ${getSliderColor(moodData.motivation)}`}>
                    {moodData.motivation}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={moodData.motivation}
                  onChange={(e) =>
                    setMoodData({
                      ...moodData,
                      motivation: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${moodData.motivation}%, hsl(var(--secondary)) ${moodData.motivation}%, hsl(var(--secondary)) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Unmotivated</span>
                  <span>Highly Motivated</span>
                </div>
              </div>

              <Button onClick={() => setStep(3)} className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contributing Factors */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="size-5 text-primary" />
                <span>What's influencing your mood?</span>
              </CardTitle>
              <CardDescription>
                Select all activities that apply today (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {factors.map((factor) => (
                  <button
                    key={factor.id}
                    onClick={() => toggleFactor(factor.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      moodData.factors.includes(factor.id)
                        ? "border-primary bg-accent shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{factor.icon}</div>
                      <p className="text-xs font-medium">{factor.label}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(4)} className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Notes & Complete */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="size-5 text-primary" />
                <span>Anything else to share?</span>
              </CardTitle>
              <CardDescription>
                Optional: Add any thoughts or notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Preview */}
              <div className="p-4 bg-accent rounded-lg border">
                <p className="text-sm font-medium mb-2">
                  📊 Your Check-in Summary:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>
                    • Mood: {selectedMoodData?.label} {selectedMoodData?.emoji}
                  </li>
                  <li>• Energy: {moodData.energy}%</li>
                  <li>• Stress: {moodData.stress}%</li>
                  <li>• Motivation: {moodData.motivation}%</li>
                  {moodData.factors.length > 0 && (
                    <li>• Activities: {moodData.factors.length} selected</li>
                  )}
                </ul>
              </div>

              <Textarea
                placeholder="How are you feeling? What's on your mind? Any challenges today?"
                value={moodData.notes}
                onChange={(e) => setMoodData({ ...moodData, notes: e.target.value })}
                rows={4}
              />

              <Button onClick={handleSubmit} className="w-full">
                Complete Check-in ✨
              </Button>
            </CardContent>
          </Card>
        )}

        {/* AI Insight Card */}
        <Card className="mt-4 bg-accent/50">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <Brain className="size-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">AI Insight</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your mood data helps optimize task scheduling, suggest breaks,
                  and provide personalized motivation. Your patterns help us help you better! 🎯
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}