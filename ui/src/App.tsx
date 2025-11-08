import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthScreen } from './components/AuthScreen';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { GoalSetupScreen } from './components/GoalSetupScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ChatScreen } from './components/ChatScreen';
import { MoodCheckScreen } from './components/MoodCheckScreen';
import { HabitTrackerScreen } from './components/HabitTrackerScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNavigation } from './components/BottomNavigation';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [user, setUser] = useState(null);
  const [userGoals, setUserGoals] = useState([]);
  const [userHabits, setUserHabits] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);

  // Screens that should show bottom navigation
  const screensWithBottomNav = ['dashboard', 'chat', 'habits', 'progress', 'settings', 'mood'];

  useEffect(() => {
    // Simulate splash screen duration
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('welcome');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleAuth = (userData) => {
    setUser(userData);
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('goalSetup');
  };

  const handleGoalSetup = (goal) => {
    setUserGoals([...userGoals, { ...goal, id: Date.now(), createdAt: new Date() }]);
    setCurrentScreen('dashboard');
  };

  const handleNavigation = (screen, options = {}) => {
    if (screen === 'auth' && options.mode === 'login') {
      setCurrentScreen({ name: 'auth', mode: 'login' });
    } else if (screen === 'auth' && options.mode === 'signup') {
      setCurrentScreen({ name: 'auth', mode: 'signup' });
    } else {
      setCurrentScreen(screen);
    }
  };

  const addHabit = (habit) => {
    setUserHabits([...userHabits, { ...habit, id: Date.now(), streak: 0, completed: [] }]);
  };

  const logMood = (moodData) => {
    setMoodHistory([...moodHistory, { ...moodData, id: Date.now(), timestamp: new Date() }]);
  };

  const renderScreen = () => {
    const screenName = typeof currentScreen === 'string' ? currentScreen : currentScreen.name;
    switch (screenName) {
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen onNavigate={handleNavigation} />;
      case 'auth':
        return (
          <AuthScreen
            onAuth={handleAuth}
            onNavigate={handleNavigation}
            initialMode={currentScreen.mode || 'signup'}
          />
        );
      case 'forgotPassword':
        return <ForgotPasswordScreen onNavigate={handleNavigation} />;
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case 'goalSetup':
        return <GoalSetupScreen onGoalSetup={handleGoalSetup} user={user} />;
      case 'dashboard':
        return (
          <DashboardScreen
            user={user}
            goals={userGoals}
            habits={userHabits}
            onNavigate={handleNavigation}
          />
        );
      case 'chat':
        return <ChatScreen user={user} goals={userGoals} onNavigate={handleNavigation} />;
      case 'mood':
        return <MoodCheckScreen onLogMood={logMood} onNavigate={handleNavigation} />;
      case 'habits':
        return (
          <HabitTrackerScreen
            habits={userHabits}
            onAddHabit={addHabit}
            onNavigate={handleNavigation}
          />
        );
      case 'progress':
        return (
          <ProgressScreen
            goals={userGoals}
            habits={userHabits}
            moodHistory={moodHistory}
            onNavigate={handleNavigation}
          />
        );
      case 'settings':
        return <SettingsScreen user={user} onNavigate={handleNavigation} />;
      default:
        return <DashboardScreen user={user} goals={userGoals} onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto glass-card shadow-glow min-h-screen relative">
        <div className={screensWithBottomNav.includes(currentScreen) ? 'pb-20' : ''}>
          {renderScreen()}
        </div>
        
        {screensWithBottomNav.includes(currentScreen) && (
          <BottomNavigation 
            currentScreen={currentScreen} 
            onNavigate={handleNavigation} 
          />
        )}
      </div>
    </div>
  );
}