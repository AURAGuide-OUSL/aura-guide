import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Plus, CheckCircle2, Circle, Flame, Target, Clock } from 'lucide-react';

const defaultHabits = [
  { id: 1, title: 'Read for 30 minutes', streak: 7, completed: [true, true, false, true, true, true, true], target: 'Daily' },
  { id: 2, title: 'Exercise', streak: 3, completed: [false, true, false, true, false, true, false], target: 'Daily' },
  { id: 3, title: 'Meditate', streak: 12, completed: [true, true, true, true, true, true, true], target: 'Daily' },
  { id: 4, title: 'Learn coding', streak: 5, completed: [true, false, true, true, false, true, true], target: 'Daily' }
];

export function HabitTrackerScreen({ habits = defaultHabits, onAddHabit, onNavigate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', target: 'Daily' });

  const handleAddHabit = () => {
    if (newHabit.title.trim()) {
      onAddHabit({
        title: newHabit.title,
        target: newHabit.target,
        streak: 0,
        completed: Array(7).fill(false)
      });
      setNewHabit({ title: '', target: 'Daily' });
      setShowAddForm(false);
    }
  };

  const getDayLabel = (index) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[index];
  };

  const calculateWeeklyProgress = (completed) => {
    const completedCount = completed.filter(Boolean).length;
    return Math.round((completedCount / completed.length) * 100);
  };

  return (
    <div className="h-screen bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1>Habit Tracker</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowAddForm(true)}>
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Week Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">This Week</CardTitle>
            <CardDescription>Track your daily habits and build consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{getDayLabel(i)}</p>
                  <div className={`w-8 h-8 rounded-full border-2 mx-auto ${
                    i === 6 ? 'bg-primary border-primary' : 'border-muted'
                  }`}></div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Today is Sunday</p>
            </div>
          </CardContent>
        </Card>

        {/* Add Habit Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Habit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="habitTitle">Habit Title</Label>
                <Input
                  id="habitTitle"
                  placeholder="e.g., Drink 8 glasses of water"
                  value={newHabit.title}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddHabit} className="flex-1">
                  Add Habit
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Habits List */}
        <div className="space-y-3">
          {habits.map((habit) => (
            <Card key={habit.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{habit.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Flame className="size-4 text-orange-500" />
                      <span className="text-sm font-medium">{habit.streak}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Progress value={calculateWeeklyProgress(habit.completed)} className="flex-1 mr-4" />
                    <span className="text-sm text-muted-foreground">
                      {calculateWeeklyProgress(habit.completed)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-7 gap-1">
                      {habit.completed.map((completed, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 rounded-full"
                        >
                          {completed ? (
                            <CheckCircle2 className="size-4 text-green-500" />
                          ) : (
                            <Circle className="size-4 text-muted-foreground" />
                          )}
                        </Button>
                      ))}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {habit.target}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {habits.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No habits yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building positive habits that align with your goals
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="size-4 mr-2" />
                Add Your First Habit
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}