import image_5ed9a854d192b90f470926ea2e77e166d6a27d5c from 'figma:asset/5ed9a854d192b90f470926ea2e77e166d6a27d5c.png';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import appLogo from 'figma:asset/789eba7287f5e12d2f1dbbe4ed4a5f02ee010c4d.png';

export function AuthScreen({ onAuth, onNavigate, initialMode = 'signup' }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate authentication
    const userData = {
      id: Date.now(),
      name: formData.name || 'User',
      email: formData.email,
      joinedAt: new Date()
    };
    onAuth(userData);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-screen bg-background">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('welcome')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 flex items-center justify-center space-x-3">
          <img 
            src={image_5ed9a854d192b90f470926ea2e77e166d6a27d5c} 
            alt="LifePath AI Logo" 
            className="size-8 object-contain" 
          />
          {/* <h1 className="text-lg">AURA Guide</h1> */}
        </div>
      </div>

      <div className="p-6">
        <Tabs value={isSignUp ? 'signup' : 'login'} onValueChange={(value) => setIsSignUp(value === 'signup')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="login"
              className="data-[state=active]:underline data-[state=active]:text-[#04297A] data-[state=active]:font-semibold"
            >
              Log In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:underline data-[state=active]:text-[#04297A] data-[state=active]:font-semibold"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                {/* <CardTitle className="text-[rgba(4,41,122,1)] font-normal text-[14px]">Create Account</CardTitle> */}
                <CardDescription>Start your journey to achieving your life goals</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-[rgba(4,41,122,1)]">Create Account</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                {/* <CardTitle>Welcome Back</CardTitle> */}
                <CardDescription className="text-[rgba(4,41,122,1)]">Welcome Back Buddy! Continue your journey toward your goals</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">Email</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="loginPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-[rgba(4,41,122,1)]">Sign In</Button>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="w-full text-sm text-[rgba(4,41,122,1)]"
                    onClick={() => onNavigate('forgotPassword')}
                  >
                    Forgot Password?
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}