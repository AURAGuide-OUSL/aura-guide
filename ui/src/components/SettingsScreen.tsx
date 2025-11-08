import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  HelpCircle, 
  MessageSquare,
  LogOut,
  Download,
  ChevronRight
} from 'lucide-react';

export function SettingsScreen({ user, onNavigate }) {
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          description: 'Manage your personal information',
          action: () => {},
          type: 'navigate'
        },
        {
          icon: Shield,
          label: 'Privacy & Data',
          description: 'Control your data and privacy settings',
          action: () => {},
          type: 'navigate'
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Daily Reminders',
          description: 'Get notified about your daily tasks',
          action: () => {},
          type: 'toggle',
          enabled: true
        },
        {
          icon: Bell,
          label: 'Mood Check-ins',
          description: 'Reminders to log your mood',
          action: () => {},
          type: 'toggle',
          enabled: true
        },
        {
          icon: Bell,
          label: 'Motivational Messages',
          description: 'Receive encouraging messages',
          action: () => {},
          type: 'toggle',
          enabled: false
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Palette,
          label: 'Theme',
          description: 'Light, dark, or system',
          action: () => {},
          type: 'navigate',
          value: 'System'
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & FAQ',
          description: 'Get answers to common questions',
          action: () => {},
          type: 'navigate'
        },
        {
          icon: MessageSquare,
          label: 'Send Feedback',
          description: 'Help us improve the app',
          action: () => {},
          type: 'navigate'
        },
        {
          icon: Download,
          label: 'Export Data',
          description: 'Download your progress data',
          action: () => {},
          type: 'navigate'
        }
      ]
    }
  ];

  return (
    <div className="h-screen bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="flex-1 text-center">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* User Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="size-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{user?.name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
                <Badge variant="outline" className="mt-2">
                  Free Plan
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Groups */}
        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h2 className="text-lg font-medium">{group.title}</h2>
            <Card>
              <CardContent className="p-0">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.label}
                      className={`flex items-center space-x-3 p-4 ${
                        index < group.items.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.label}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {item.value && (
                          <p className="text-sm text-primary mt-1">{item.value}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.type === 'toggle' ? (
                          <Switch checked={item.enabled} />
                        ) : (
                          <ChevronRight className="size-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* App Info */}
        <Card>
          <CardContent className="p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">LifePath AI</p>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground">
              Made with ❤️ for your success
            </p>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button variant="outline" className="w-full" size="lg">
          <LogOut className="size-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}