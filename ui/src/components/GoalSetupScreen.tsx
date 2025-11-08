import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Briefcase, GraduationCap, Heart, Home, Dumbbell, DollarSign, Users, Globe, Sparkles } from 'lucide-react';

const goalCategories = [
  { id: 'career', label: 'Career', icon: Briefcase, color: 'from-blue-500 to-blue-600', description: 'Professional growth and career advancement' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'from-cyan-500 to-cyan-600', description: 'Learning new skills and knowledge' },
  { id: 'health', label: 'Health & Fitness', icon: Dumbbell, color: 'from-green-500 to-green-600', description: 'Physical wellness and fitness goals' },
  { id: 'relationships', label: 'Relationships', icon: Heart, color: 'from-red-500 to-red-600', description: 'Building meaningful connections' },
  { id: 'financial', label: 'Financial', icon: DollarSign, color: 'from-yellow-500 to-yellow-600', description: 'Financial independence and wealth' },
  { id: 'personal', label: 'Personal Growth', icon: Users, color: 'from-purple-500 to-purple-600', description: 'Self-improvement and mindfulness' },
  { id: 'lifestyle', label: 'Lifestyle', icon: Home, color: 'from-ash-500 to-ash-600', description: 'Life balance and experiences' },
  { id: 'travel', label: 'Travel & Adventure', icon: Globe, color: 'from-teal-500 to-teal-600', description: 'Exploring the world and new experiences' }
];

const categoryForms = {
  career: [
    { field: 'targetRole', label: 'Target Role/Position', type: 'input', placeholder: 'e.g., Senior Software Engineer, Marketing Manager' },
    { field: 'currentRole', label: 'Current Role', type: 'input', placeholder: 'Your current position' },
    { field: 'industry', label: 'Industry', type: 'select', options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales', 'Other'] },
    { field: 'skills', label: 'Skills to Develop', type: 'textarea', placeholder: 'What skills do you need to acquire or improve?' },
    { field: 'experience', label: 'Years of Experience', type: 'select', options: ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'] }
  ],
  education: [
    { field: 'subject', label: 'Subject/Field', type: 'input', placeholder: 'e.g., Data Science, Web Development, Spanish' },
    { field: 'currentLevel', label: 'Current Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    { field: 'learningMethod', label: 'Preferred Learning Method', type: 'select', options: ['Online Courses', 'University/College', 'Self-Study', 'Bootcamp', 'Mentorship'] },
    { field: 'studyTime', label: 'Study Time Available', type: 'select', options: ['1-2 hours/day', '3-4 hours/day', '5+ hours/day', 'Weekends only', 'Full-time'] },
    { field: 'certification', label: 'Target Certification/Degree', type: 'input', placeholder: 'What certification or degree are you aiming for?' }
  ],
  health: [
    { field: 'fitnessGoal', label: 'Primary Fitness Goal', type: 'select', options: ['Weight Loss', 'Muscle Gain', 'Endurance', 'Strength', 'Flexibility', 'General Health'] },
    { field: 'currentActivity', label: 'Current Activity Level', type: 'select', options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'] },
    { field: 'workoutPreference', label: 'Workout Preference', type: 'select', options: ['Gym', 'Home Workouts', 'Outdoor Activities', 'Sports', 'Yoga/Pilates', 'Running'] },
    { field: 'healthMetrics', label: 'Key Health Metrics', type: 'textarea', placeholder: 'Weight, body fat %, blood pressure, etc.' },
    { field: 'dietaryGoals', label: 'Dietary Goals', type: 'textarea', placeholder: 'Any specific dietary changes or nutrition goals?' }
  ],
  financial: [
    { field: 'financialGoal', label: 'Primary Financial Goal', type: 'select', options: ['Emergency Fund', 'Debt Payoff', 'Savings', 'Investment', 'Retirement', 'Buy Home', 'Start Business'] },
    { field: 'targetAmount', label: 'Target Amount', type: 'input', placeholder: 'e.g., $10,000, $100,000' },
    { field: 'currentSavings', label: 'Current Savings', type: 'input', placeholder: 'How much do you currently have saved?' },
    { field: 'monthlyIncome', label: 'Monthly Income Range', type: 'select', options: ['Under $3,000', '$3,000-$5,000', '$5,000-$7,500', '$7,500-$10,000', 'Over $10,000'] },
    { field: 'riskTolerance', label: 'Risk Tolerance', type: 'select', options: ['Conservative', 'Moderate', 'Aggressive'] }
  ],
  relationships: [
    { field: 'relationshipGoal', label: 'Relationship Goal', type: 'select', options: ['Find Partner', 'Improve Current Relationship', 'Build Friendships', 'Family Relationships', 'Professional Network'] },
    { field: 'currentStatus', label: 'Current Status', type: 'select', options: ['Single', 'In Relationship', 'Married', 'Divorced', 'Widowed'] },
    { field: 'socialCircle', label: 'Social Circle Size', type: 'select', options: ['Very Small (1-2 close friends)', 'Small (3-5 close friends)', 'Medium (6-10 friends)', 'Large (10+ friends)'] },
    { field: 'communicationStyle', label: 'Communication Style', type: 'select', options: ['Direct', 'Diplomatic', 'Passive', 'Assertive', 'Varies by situation'] },
    { field: 'socialActivities', label: 'Preferred Social Activities', type: 'textarea', placeholder: 'What activities help you connect with others?' }
  ],
  personal: [
    { field: 'growthArea', label: 'Growth Area', type: 'select', options: ['Self-Confidence', 'Emotional Intelligence', 'Mindfulness', 'Creativity', 'Leadership', 'Communication', 'Time Management'] },
    { field: 'currentChallenges', label: 'Current Challenges', type: 'textarea', placeholder: 'What personal challenges are you facing?' },
    { field: 'practiceTime', label: 'Daily Practice Time', type: 'select', options: ['5-10 minutes', '15-30 minutes', '30-60 minutes', '1+ hours'] },
    { field: 'preferredMethods', label: 'Preferred Methods', type: 'select', options: ['Reading', 'Meditation', 'Journaling', 'Therapy/Coaching', 'Workshops', 'Online Courses'] },
    { field: 'support', label: 'Support System', type: 'select', options: ['Self-guided', 'With mentor/coach', 'Group setting', 'Family/friends support'] }
  ],
  lifestyle: [
    { field: 'lifestyleGoal', label: 'Lifestyle Goal', type: 'select', options: ['Work-Life Balance', 'Minimalism', 'Sustainability', 'Adventure', 'Luxury', 'Family Time', 'Hobbies'] },
    { field: 'currentSatisfaction', label: 'Current Life Satisfaction', type: 'select', options: ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] },
    { field: 'priorities', label: 'Life Priorities', type: 'textarea', placeholder: 'What matters most to you in life?' },
    { field: 'constraints', label: 'Current Constraints', type: 'textarea', placeholder: 'What is limiting your ideal lifestyle?' },
    { field: 'timeFrame', label: 'Desired Timeline', type: 'select', options: ['3 months', '6 months', '1 year', '2-3 years', '5+ years'] }
  ],
  travel: [
    { field: 'travelGoal', label: 'Travel Goal', type: 'select', options: ['Visit specific country', 'World tour', 'Adventure travel', 'Cultural experiences', 'Digital nomad', 'Family vacation'] },
    { field: 'destinations', label: 'Dream Destinations', type: 'textarea', placeholder: 'Where would you like to go?' },
    { field: 'budget', label: 'Travel Budget', type: 'select', options: ['Under $1,000', '$1,000-$5,000', '$5,000-$10,000', '$10,000-$20,000', '$20,000+'] },
    { field: 'travelStyle', label: 'Travel Style', type: 'select', options: ['Budget/Backpacking', 'Mid-range', 'Luxury', 'Adventure/Extreme', 'Cultural/Educational'] },
    { field: 'duration', label: 'Trip Duration', type: 'select', options: ['Weekend trips', '1-2 weeks', '1 month', '3-6 months', '1+ year'] }
  ]
};

export function GoalSetupScreen({ onGoalSetup, user }) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [goalData, setGoalData] = useState({
    title: '',
    description: '',
    category: '',
    timeframe: '',
    motivation: ''
  });

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setGoalData(prev => ({ ...prev, category: categoryId }));
    setStep(2);
  };

  const handleFormData = (field, value) => {
    setGoalData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGoalSetup(goalData);
  };

  const category = goalCategories.find(cat => cat.id === selectedCategory);
  const formFields = categoryForms[selectedCategory] || [];

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ash-50 via-white to-blue-50">
        <div className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl mb-2 text-gradient">Choose your goal category</h2>
            <p className="text-ash-600">This helps us create a personalized plan just for you</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {goalCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id}
                  className="cursor-pointer transition-all duration-300 hover:shadow-glow hover:scale-105 glass-card border-0 border-ash-200"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color} text-white shadow-lg`}>
                        <Icon className="size-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-ash-800">{category.label}</h3>
                        <p className="text-sm text-ash-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ash-50 via-white to-blue-50">
      <div className="flex items-center p-4 glass-card border-b border-ash-200">
        <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-blue-600 hover:bg-blue-50">
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="flex-1 text-center text-gradient">Goal Details</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Category Badge */}
        <div className="flex justify-center">
          <Badge className={`bg-gradient-to-r ${category?.color} text-white px-4 py-2 shadow-lg`}>
            <category.icon className="size-4 mr-2" />
            {category?.label}
          </Badge>
        </div>

        <Card className="glass-card border-0 shadow-card border-ash-200">
          <CardHeader>
            <CardTitle className="text-gradient">Tell us about your {category?.label.toLowerCase()} goal</CardTitle>
            <CardDescription className="text-ash-600">
              We'll create a personalized roadmap to help you succeed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Goal Info */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-ash-700">Goal Title</Label>
                <Input
                  id="title"
                  placeholder={`e.g., ${category?.id === 'career' ? 'Become a Senior Developer' : category?.id === 'health' ? 'Lose 20 pounds' : 'Achieve my dream'}`}
                  value={goalData.title}
                  onChange={(e) => handleFormData('title', e.target.value)}
                  className="bg-white border-ash-200 focus:border-blue-500"
                  required
                />
              </div>

              {/* Category-specific fields */}
              {formFields.map((field) => (
                <div key={field.field} className="space-y-2">
                  <Label htmlFor={field.field} className="text-ash-700">{field.label}</Label>
                  {field.type === 'input' && (
                    <Input
                      id={field.field}
                      placeholder={field.placeholder}
                      value={goalData[field.field] || ''}
                      onChange={(e) => handleFormData(field.field, e.target.value)}
                      className="bg-white border-ash-200 focus:border-blue-500"
                    />
                  )}
                  {field.type === 'select' && (
                    <Select value={goalData[field.field] || ''} onValueChange={(value) => handleFormData(field.field, value)}>
                      <SelectTrigger className="bg-white border-ash-200 focus:border-blue-500">
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === 'textarea' && (
                    <Textarea
                      id={field.field}
                      placeholder={field.placeholder}
                      value={goalData[field.field] || ''}
                      onChange={(e) => handleFormData(field.field, e.target.value)}
                      rows={3}
                      className="bg-white border-ash-200 focus:border-blue-500"
                    />
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="timeframe" className="text-ash-700">Target Timeframe</Label>
                <Select value={goalData.timeframe} onValueChange={(value) => handleFormData('timeframe', value)}>
                  <SelectTrigger className="bg-white border-ash-200 focus:border-blue-500">
                    <SelectValue placeholder="When do you want to achieve this?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 months</SelectItem>
                    <SelectItem value="6months">6 months</SelectItem>
                    <SelectItem value="1year">1 year</SelectItem>
                    <SelectItem value="2years">2 years</SelectItem>
                    <SelectItem value="5years">5+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation" className="text-ash-700">Why is this important to you?</Label>
                <Textarea
                  id="motivation"
                  placeholder="What drives you to achieve this goal? How will your life change?"
                  value={goalData.motivation}
                  onChange={(e) => handleFormData('motivation', e.target.value)}
                  rows={3}
                  className="bg-white border-ash-200 focus:border-blue-500"
                  required
                />
              </div>

              <Button type="submit" className="w-full gradient-primary shadow-glow hover:scale-105 transition-all duration-200">
                <Sparkles className="size-4 mr-2" />
                Create My Personalized Plan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}