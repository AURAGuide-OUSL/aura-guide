import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, Target, Calendar, Award, Flame, Heart } from 'lucide-react';

export function ProgressScreen({ goals, habits, moodHistory, onNavigate }) {
  const currentGoal = goals[0];
  const totalHabits = habits.length;
  const activeStreaks = habits.filter(habit => habit.streak > 0).length;
  const avgMood = moodHistory.length > 0 ? 
    moodHistory.slice(-7).reduce((sum, mood) => {
      const moodScore = { amazing: 5, good: 4, okay: 3, stressed: 2, sad: 1, anxious: 1 };
      return sum + (moodScore[mood.mood] || 3);
    }, 0) / Math.min(moodHistory.length, 7) : 3;

  const weeklyStats = [
    { day: 'Mon', completed: 3, total: 4 },
    { day: 'Tue', completed: 4, total: 4 },
    { day: 'Wed', completed: 2, total: 4 },
    { day: 'Thu', completed: 4, total: 4 },
    { day: 'Fri', completed: 3, total: 4 },
    { day: 'Sat', completed: 4, total: 4 },
    { day: 'Sun', completed: 2, total: 4 }
  ];

  const achievements = [
    { id: 1, title: 'First Goal Set', description: 'Created your first life goal', earned: true, icon: Target },
    { id: 2, title: 'Week Warrior', description: 'Completed 7 days of tasks', earned: true, icon: Calendar },
    { id: 3, title: 'Habit Hero', description: 'Maintained a 7-day streak', earned: true, icon: Flame },
    { id: 4, title: 'Mood Master', description: 'Tracked mood for 14 days', earned: false, icon: Heart },
    { id: 5, title: 'Goal Getter', description: 'Completed your first milestone', earned: false, icon: Award }
  ];

  return (
    <div className="h-screen bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="flex-1 text-center">Progress Overview</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="size-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">73%</p>
              <p className="text-sm text-muted-foreground">Goal Progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="size-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{activeStreaks}</p>
              <p className="text-sm text-muted-foreground">Active Streaks</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Goal Progress */}
        {currentGoal && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Current Goal</CardTitle>
              <CardDescription>{currentGoal.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Progress</span>
                  <span className="text-sm font-medium">73%</span>
                </div>
                <Progress value={73} className="h-3" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">5</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">2</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-600">3</p>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">This Week's Activity</CardTitle>
            <CardDescription>Daily task completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyStats.map((day, index) => (
                <div key={day.day} className="flex items-center space-x-3">
                  <span className="text-sm font-medium w-8">{day.day}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(day.completed / day.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {day.completed}/{day.total}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mood Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Mood Trend</CardTitle>
            <CardDescription>Your emotional wellbeing this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Heart className="size-8 text-red-500" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-bold">
                    {avgMood >= 4 ? 'Great!' : avgMood >= 3 ? 'Good' : 'Needs attention'}
                  </span>
                  <Badge variant={avgMood >= 4 ? 'default' : avgMood >= 3 ? 'secondary' : 'destructive'}>
                    {avgMood.toFixed(1)}/5
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {avgMood >= 4 ? 'You\'re feeling great this week! Keep it up.' :
                   avgMood >= 3 ? 'Your mood has been stable. Nice work!' :
                   'Consider taking some time for self-care.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Achievements</CardTitle>
            <CardDescription>Milestones you've unlocked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div 
                    key={achievement.id} 
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      achievement.earned 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-muted/30 border-muted'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      achievement.earned 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        achievement.earned ? '' : 'text-muted-foreground'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.earned && (
                      <Award className="size-5 text-yellow-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}