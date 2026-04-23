import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { HeartPlus, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function Login() {
  const { user, login, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) return null;
  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(username, password);
      toast.success('Access Granted');
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8 gap-4">
          <div className="bg-primary/10 p-4 rounded-3xl">
            <HeartPlus className="w-12 h-12 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">HospEase</h1>
            <p className="text-zinc-500 font-medium">Healthcare Management Suite</p>
          </div>
        </div>

        <Card className="border-zinc-200 shadow-xl shadow-zinc-200/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Admin Authentication</CardTitle>
            <CardDescription>
              Welcome back. Please enter your credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    id="username"
                    placeholder="Enter username" 
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="Enter password" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit"
                size="lg" 
                className="w-full h-12 gap-2 text-base font-medium shadow-lg hover:shadow-primary/20 transition-all font-sans"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Login to Dashboard'
                )}
              </Button>
            </form>
            <p className="text-xs text-center text-zinc-400 mt-6 px-8 leading-relaxed italic">
              "Access is restricted to authorized personnel. Session activity is monitored for security."
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
