import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Smile, Frown, Meh, Heart, ThumbsUp } from 'lucide-react';

const moodOptions = [
  { id: 'amazing', label: 'Amazing', emoji: '🤩', color: 'bg-green-100 text-green-700 border-green-300', icon: ThumbsUp },
  { id: 'good', label: 'Good', emoji: '😊', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Smile },
  { id: 'okay', label: 'Okay', emoji: '😐', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Meh },
  { id: 'stressed', label: 'Stressed', emoji: '😰', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: Frown },
  { id: 'sad', label: 'Sad', emoji: '😢', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Frown },
  { id: 'anxious', label: 'Anxious', emoji: '😟', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: Frown }
];

const energyLevels = [
  { id: 'high', label: 'High Energy', emoji: '⚡' },
  { id: 'medium', label: 'Medium Energy', emoji: '🔋' },
  { id: 'low', label: 'Low Energy', emoji: '😴' }
];

export function MoodCheckScreen({ onLogMood, onNavigate }) {
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedEnergy, setSelectedEnergy] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    const moodData = {
      mood: selectedMood,
      energy: selectedEnergy,
      notes,
      timestamp: new Date()
    };
    onLogMood(moodData);
    onNavigate('dashboard');
  };

  const selectedMoodData = moodOptions.find(m => m.id === selectedMood);

  return (
    <div className="h-screen bg-background">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="flex-1 text-center">Mood Check-in</h1>
      </div>

      <div className="p-6">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="size-6 text-red-500" />
                <span>How are you feeling?</span>
              </CardTitle>
              <CardDescription>
                Your emotional state helps us provide better support and adapt your plan accordingly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {moodOptions.map((mood) => (
                  <Button
                    key={mood.id}
                    variant={selectedMood === mood.id ? "default" : "outline"}
                    className={`h-auto p-4 flex flex-col space-y-2 ${
                      selectedMood === mood.id ? '' : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedMood(mood.id)}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-sm">{mood.label}</span>
                  </Button>
                ))}
              </div>
              
              {selectedMood && (
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full mt-6"
                >
                  Next
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Energy Level</CardTitle>
              <CardDescription>
                How's your energy today? This helps us plan appropriate tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {energyLevels.map((energy) => (
                  <Button
                    key={energy.id}
                    variant={selectedEnergy === energy.id ? "default" : "outline"}
                    className="w-full h-auto p-4 flex items-center space-x-3"
                    onClick={() => setSelectedEnergy(energy.id)}
                  >
                    <span className="text-xl">{energy.emoji}</span>
                    <span>{energy.label}</span>
                  </Button>
                ))}
              </div>
              
              {selectedEnergy && (
                <Button 
                  onClick={() => setStep(3)} 
                  className="w-full mt-6"
                >
                  Next
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Anything specific on your mind? (Optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm">
                  <strong>Mood:</strong> {selectedMoodData?.emoji} {selectedMoodData?.label}
                </p>
                <p className="text-sm mt-1">
                  <strong>Energy:</strong> {energyLevels.find(e => e.id === selectedEnergy)?.emoji} {energyLevels.find(e => e.id === selectedEnergy)?.label}
                </p>
              </div>
              
              <Textarea
                placeholder="What's on your mind? Any specific challenges or wins today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              
              <Button onClick={handleSubmit} className="w-full">
                Complete Check-in
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}