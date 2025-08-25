'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Eye, EyeOff, Building2, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useLogin } from '@/hooks/api/useAuth';
import { getSubdomain, getAuthToken } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const { mutate: login, isPending, error } = useLogin();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const token = getAuthToken();
    
    
    if (token && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Submitting login form:', { email: formData.email });
    login(formData);
  };

  const subdomain = getSubdomain();

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
          <div className="max-w-md">
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mr-3">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ClientSync</h1>
                <p className="text-blue-100 text-sm">Customer Management Platform</p>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Welcome back to {subdomain ? (
                <span className="text-yellow-300 capitalize">{subdomain}</span>
              ) : (
                <span className="text-yellow-300">ClientSync</span>
              )}
            </h2>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Continue managing your customer relationships with powerful tools and insights.
            </p>

            {/* Feature Pills */}
            <div className="space-y-4">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Shield className="h-5 w-5 text-green-300 mr-3" />
                <span className="text-sm">Enterprise-grade security</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Sparkles className="h-5 w-5 text-yellow-300 mr-3" />
                <span className="text-sm">AI-powered insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-40 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="bg-blue-600 rounded-xl p-3 mr-3">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ClientSync</h1>
              {subdomain && (
                <p className="text-sm text-gray-600 capitalize">{subdomain}</p>
              )}
            </div>
          </div>

          <Card className="border-0 shadow-xl bg-white/80  backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 px-6">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {(error as any).message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      required
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.remember}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, remember: checked as boolean }))
                      }
                      disabled={isPending}
                      className="border-gray-300"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </CardContent>
              
              <CardFooter className="px-6 pt-2 pb-6">
                <div className="w-full space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl group" 
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Don't have an account? </span>
                    <Link 
                      href="/auth/register" 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Create one now
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Protected by enterprise-grade security. 
              <Link href="/privacy" className="hover:text-gray-700 transition-colors ml-1">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}