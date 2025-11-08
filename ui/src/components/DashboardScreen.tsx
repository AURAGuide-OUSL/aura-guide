import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  MessageCircle, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Plus,
  Star,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';

export function DashboardScreen({ user, goals, habits, onNavigate }) {
  const currentGoal = goals[0]; // Assuming first goal is primary
  const todaysTasks = [
    { id: 1, title: "Review programming fundamentals", completed: false, time: "30 min", priority: "high" },
    { id: 2, title: "Complete online course module", completed: true, time: "45 min", priority: "medium" },
    { id: 3, title: "Practice coding problem", completed: false, time: "20 min", priority: "high" },
    { id: 4, title: "Read industry blog post", completed: false, time: "15 min", priority: "low" }
  ];

  const completedTasks = todaysTasks.filter(task => task.completed).length;
  const progress = Math.round((completedTasks / todaysTasks.length) * 100);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-blue-500 to-blue-600';
      case 'low': return 'from-ash-400 to-ash-500';
      default: return 'from-ash-400 to-ash-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ash-50 via-white to-blue-50">
      {/* Header */}
      <div className="glass-card p-6 border-b border-ash-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gradient">Good morning, {user?.name || 'User'}! ✨</h1>
            <p className="text-ash-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-glow">
            <Sparkles className="size-6" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Daily Progress */}
        <Card className="glass-card border-0 shadow-card overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
          <CardHeader className="relative pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center text-ash-800">
                <Zap className="size-5 text-blue-600 mr-2" />
                Today's Progress
              </CardTitle>
              <Badge className={`${progress > 50 ? 'gradient-success' : 'bg-ash-400'} text-white shadow-sm`}>
                {completedTasks}/{todaysTasks.length} tasks
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              <Progress value={progress} className="h-3 bg-ash-100" />
              <p className="text-sm text-ash-600">
                {progress}% complete - You're doing amazing! 🎯
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Goal */}
        {currentGoal && (
          <Card className="glass-card border-0 shadow-card border-ash-200">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Target className="size-5 text-blue-600" />
                <CardTitle className="text-lg text-gradient">Current Goal</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-medium text-ash-800">{currentGoal.title}</h3>
                <p className="text-sm text-ash-600 line-clamp-2">
                  {currentGoal.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                    {currentGoal.category}
                  </Badge>
                  <span className="text-sm text-ash-500">{currentGoal.timeframe}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Tasks */}
        <Card className="glass-card border-0 shadow-card border-ash-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="size-5 text-blue-600" />
                <CardTitle className="text-lg text-gradient">Today's Tasks</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                <Plus className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <div key={task.id} className="glass-card p-3 rounded-xl border-0 hover:shadow-glow transition-all duration-200 border-ash-100">
                  <div className="flex items-center space-x-3">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      task.completed ? 'bg-blue-600 border-blue-600' : 'border-ash-400'
                    }`}>
                      {task.completed && <CheckCircle2 className="size-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${task.completed ? 'line-through text-ash-500' : 'text-ash-700'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getPriorityColor(task.priority)}`}></div>
                        <span className="text-xs text-ash-500 capitalize">{task.priority} priority</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-ash-500">
                      <Clock className="size-3" />
                      <span>{task.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col space-y-2 glass-card border-0 hover:shadow-glow transition-all duration-200 border-ash-200"
            onClick={() => onNavigate('mood')}
          >
            <Heart className="size-6 text-red-500" />
            <span className="text-sm text-ash-700">Log Mood</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col space-y-2 glass-card border-0 hover:shadow-glow transition-all duration-200 border-ash-200"
            onClick={() => onNavigate('chat')}
          >
            <MessageCircle className="size-6 text-blue-600" />
            <span className="text-sm text-ash-700">AI Coach</span>
          </Button>
        </div>

        {/* Motivational Quote */}
        <Card className="glass-card border-0 bg-gradient-to-r from-blue-50 to-ash-50 shadow-card overflow-hidden border-ash-200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full transform translate-x-12 -translate-y-12"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-start space-x-3">
              <Star className="size-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  "The journey of a thousand miles begins with one step."
                </p>
                <p className="text-xs text-ash-600 mt-1">- Lao Tzu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}