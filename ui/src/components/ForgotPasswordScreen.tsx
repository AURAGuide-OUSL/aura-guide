import image_5ed9a854d192b90f470926ea2e77e166d6a27d5c from 'figma:asset/5ed9a854d192b90f470926ea2e77e166d6a27d5c.png';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Mail, Shield, CheckCircle } from 'lucide-react';
import appLogo from 'figma:asset/789eba7287f5e12d2f1dbbe4ed4a5f02ee010c4d.png';

export function ForgotPasswordScreen({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleBackToLogin = () => {
    onNavigate('auth', { mode: 'login' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ash-50 via-white to-blue-50">
      <div className="flex items-center p-4 glass-card border-b border-ash-200">
        <Button variant="ghost" size="sm" onClick={handleBackToLogin} className="text-blue-600 hover:bg-blue-50">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 flex items-center justify-center space-x-3">
          <img 
            src={image_5ed9a854d192b90f470926ea2e77e166d6a27d5c} 
            alt="LifePath AI Logo" 
            className="size-8 object-contain" 
          />
          {/* <h1 className="text-lg text-gradient">Reset Password</h1> */}
        </div>
      </div>

      <div className="p-6">
        {!isSubmitted ? (
          <Card className="glass-card border-0 shadow-card border-ash-200">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-glow mb-4 w-fit bg-[rgba(4,41,122,1)]">
                <Shield className="size-6" />
              </div>
              <CardTitle className="text-gradient text-[rgba(4,41,122,1)]">Forgot your password?</CardTitle>
              <CardDescription className="text-ash-600">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-ash-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ash-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border-ash-200 focus:border-blue-500 pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[rgba(4,41,122,1)] shadow-glow hover:scale-105 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    onClick={handleBackToLogin}
                    className="text-ash-600 hover:text-[#04297A]"
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-0 shadow-card border-ash-200">
            <CardContent className="p-8 text-center space-y-6">
              <div className="mx-auto p-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-glow w-fit">
                <CheckCircle className="size-8" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl text-gradient">Check your email!</h2>
                <p className="text-ash-600">
                  We've sent a password reset link to
                </p>
                <p className="font-medium text-blue-600">{email}</p>
              </div>

              <div className="glass-card p-4 rounded-xl border-0 bg-blue-50/50 border-ash-100">
                <p className="text-sm text-ash-700">
                  <strong>Didn't receive the email?</strong> Check your spam folder or try again with a different email address.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full border-ash-300 text-ash-700 hover:bg-ash-50"
                >
                  Try Different Email
                </Button>
                
                <Button 
                  onClick={handleBackToLogin}
                  className="w-full gradient-primary shadow-glow hover:scale-105 transition-all duration-200"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <Card className="glass-card border-0 bg-gradient-to-r from-ash-50 to-blue-50 shadow-card border-ash-200">
            <CardContent className="p-4">
              <p className="text-sm text-ash-600">
                Still having trouble? Contact our support team at{' '}
                <span className="text-[rgba(4,41,122,1)] font-medium">support@aura-guide.com</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}