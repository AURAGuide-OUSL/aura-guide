import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ArrowLeft, Send, Bot, User, Sparkles } from 'lucide-react';

const initialMessages = [
  {
    id: 1,
    type: 'ai',
    content: "Hello! I'm your AI life coach. I'm here to help you stay on track with your goals and provide support whenever you need it. How are you feeling about your progress today?",
    timestamp: new Date()
  }
];

const aiResponses = [
  "That's great to hear! Maintaining momentum is key to achieving your goals. What specific task would you like to focus on next?",
  "I understand that can be challenging. Remember, every small step counts toward your bigger goal. What's one small thing you could do today to move forward?",
  "It sounds like you're making real progress! How does it feel to see your efforts paying off?",
  "That's a common feeling when working toward big goals. Let's break this down into smaller, more manageable steps. What's the next milestone you'd like to reach?",
  "I'm proud of your dedication! Consistency is more important than perfection. How can I help you maintain this positive momentum?",
  "Everyone faces obstacles on their journey. What matters is how we respond to them. What do you think might help you overcome this challenge?",
  "Your motivation is inspiring! Remember to celebrate these small wins - they add up to big achievements over time."
];

export function ChatScreen({ user, goals, onNavigate }) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: randomResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-white border-slate-200">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')} className="text-slate-600 hover:text-slate-800 hover:bg-slate-100">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 flex items-center justify-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <Bot className="size-5 text-blue-600" />
          </div>
          <div>
            <h1 className="font-medium text-slate-800">AI Life Coach</h1>
            <p className="text-xs text-slate-500">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-full ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200'
              }`}>
                {message.type === 'user' ? (
                  <User className="size-4" />
                ) : (
                  <Bot className="size-4 text-slate-600" />
                )}
              </div>
              <Card className={`p-3 border-slate-200 shadow-sm ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' 
                    ? 'text-blue-100' 
                    : 'text-slate-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-2 max-w-[80%]">
              <div className="p-2 rounded-full bg-slate-200">
                <Bot className="size-4 text-slate-600" />
              </div>
              <Card className="p-3 bg-white border-slate-200 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </Card>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="p-2 border-t border-slate-200 bg-white">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            "How's my progress?",
            "I'm feeling stuck",
            "Need motivation",
            "Plan my day"
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="whitespace-nowrap border-slate-300 text-slate-600 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => setNewMessage(suggestion)}
            >
              <Sparkles className="size-3 mr-1 text-blue-500" />
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white border-slate-200">
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-slate-300 focus:border-blue-500"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}