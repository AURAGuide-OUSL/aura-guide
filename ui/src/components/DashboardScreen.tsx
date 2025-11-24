import React from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
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
  Zap,
} from "lucide-react";

export function DashboardScreen({ user, goals, habits, onNavigate }) {
  const currentGoal = goals[0]; // Assuming first goal is primary
//   This allows ML/AI algorithms to store extra metadata for each task.
 const todaysTasks = [
   {
     id: 1,
     title: "Review programming fundamentals",
     completed: false,
     time: "30 min",
     priority: "high",
     category: "learning",      // AI category
     recommendedTime: "morning", // AI suggested time
     moodImpact: 0.2,          // How it affects mood
     importanceScore: 0.9,     // AI predicted importance
   },

 ];


  const completedTasks = todaysTasks.filter((task) => task.completed).length;
  const progress = Math.round((completedTasks / todaysTasks.length) * 100);
  const today = new Date().toISOString().split("T")[0];
 const rescheduledTasks = [
   {
     id: 2,
     title: "Complete AI assignment",
     completed: false,
     dueDate: today,
   }
 ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "from-red-500 to-red-600";
      case "medium":
        return "from-blue-500 to-blue-600";
      case "low":
        return "from-ash-400 to-gray-500";
      default:
        return "from-ash-400 to-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ash-50 via-white to-blue-50">
      {/* Header */}
      <div className="glass-card p-6 border-b border-ash-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gradient">
              Good morning, {user?.name || "User"}! ✨
            </h1>
            <p className="text-ash-600">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
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
              <Badge
                className={`${progress > 50 ? "gradient-success" : "bg-ash-400"} text-white shadow-sm`}
              >
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
                <CardTitle className="text-lg text-gradient">
                  Current Goal
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-medium text-ash-800">{currentGoal.title}</h3>
                <p className="text-sm text-ash-600 line-clamp-2">{currentGoal.description}</p>
                {currentGoal.milestones?.map(m => (
                  <div key={m.id} className="flex items-center justify-between">
                    <p className={`text-sm ${m.completed ? "line-through text-ash-500" : "text-ash-700"}`}>{m.title}</p>
                    <Badge className={m.completed ? "bg-green-500 text-white" : "bg-ash-100 text-ash-700"}>
                      {m.completed ? "Done" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {rescheduledTasks.length > 0 && (
          <Card className="glass-card border-blue-200 bg-blue-50 shadow-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="size-5 text-blue-600" />
                <CardTitle className="text-lg text-gradient">
                  AI Rescheduled Tasks
                </CardTitle>
              </div>
              <p className="text-sm text-600">
                I rescheduled {rescheduledTasks.length} task(s) to help you stay on track 🔁
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rescheduledTasks.map(task => (
                  <div key={task.id} className="glass-card p-3 rounded-xl flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-medium text-ash-800">{task.title}</p>
                      <p className="text-xs text-blue-600 mt-1">Rescheduled by AI</p>
                    </div>
                    <Button size="sm" className="rounded-full bg-blue-500 text-white">
                      ✓
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI-Powered Task Plan- Today's Tasks*/}
      <Card className="glass-card border-0 shadow-card border-ash-200">
        <CardHeader className="pb-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="size-5 text-blue-600" />
            <CardTitle className="text-lg text-gradient">AI Task Plan</CardTitle>
          </div>
          <Badge className="bg-blue-100 text-blue-700">
            {todaysTasks.filter(t => !t.completed).length + rescheduledTasks.length} tasks remaining
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
           {[...todaysTasks, ...rescheduledTasks].map(task => (
             <div key={task.id} className="glass-card p-3 rounded-xl hover:shadow-glow flex justify-between items-center">
               <div>
                 <p className="font-medium text-ash-800">{task.title}</p>
                 <div className="flex space-x-2 mt-1 text-xs text-ash-500 items-center">
                   {/* Add priority badge here */}
                   {task.priority && (
                     <div className={`p-1 rounded-full text-white text-[10px] ${getPriorityColor(task.priority)}`}>
                       {task.priority}
                     </div>
                   )}

                   {task.category && <span>{task.category}</span>}
                   {task.importanceScore !== undefined && <span>AI Score: {Math.round(task.importanceScore * 100)}%</span>}
                   {task.recommendedTime && <span>Time: {task.recommendedTime}</span>}
                   {task.dueDate && rescheduledTasks.some(t => t.id === task.id) && (
                     <Badge className="bg-yellow-200 text-yellow-800 text-[10px] px-1 rounded">Rescheduled</Badge>
                   )}
                 </div>
               </div>
               <Button
                 size="sm"
                 onClick={() => console.log("Mark complete", task.id)}
                 className={`rounded-full ${task.completed ? "bg-green-500" : "bg-ash-200"}`}
               >
                 ✓
               </Button>
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
            onClick={() => onNavigate("mood")}
          >
            <Heart className="size-6 text-red-500" />
            <span className="text-sm text-ash-700">Log Mood</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col space-y-2 glass-card border-0 hover:shadow-glow transition-all duration-200 border-ash-200"
            onClick={() => onNavigate("chat")}
          >
            <MessageCircle className="size-6 text-blue-600" />
            <span className="text-sm text-ash-700">AI Coach</span>
          </Button>
        </div>
        <Card className="glass-card shadow-card bg-gradient-to-r from-blue-50 to-ash-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Heart className="size-5 text-red-500" />
              <CardTitle className="text-lg text-gradient">Mood & Motivation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ash-700">
              Based on your recent tasks and streaks, your mood is predicted to be: <strong>Happy</strong> 😊
            </p>
            <p className="text-xs text-ash-500 mt-1">
              AI Tip: Complete your high priority task first to boost your energy!
            </p>
          </CardContent>
        </Card>


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
