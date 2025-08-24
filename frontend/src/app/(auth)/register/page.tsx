'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Lock, User, Building, Check, X, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Zap, Building2 } from 'lucide-react';
import { useRegister, useCheckSubdomain } from '@/hooks/api/useAuth';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    subdomain: '',
  });
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { mutate: register, isPending, error } = useRegister();
  const { mutate: checkSubdomain, isPending: isCheckingSubdomain } = useCheckSubdomain();

  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Name validation (should contain at least first name)
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Please enter your full name';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Organization name validation
    if (!formData.organizationName.trim()) {
      errors.organizationName = 'Organization name is required';
    } else if (formData.organizationName.trim().length < 2) {
      errors.organizationName = 'Organization name must be at least 2 characters';
    }
    
    // Subdomain validation
    const subdomainRegex = /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?$/;
    if (!formData.subdomain) {
      errors.subdomain = 'Subdomain is required';
    } else if (!subdomainRegex.test(formData.subdomain)) {
      errors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    } else if (formData.subdomain.length < 3) {
      errors.subdomain = 'Subdomain must be at least 3 characters';
    } else if (subdomainStatus !== 'available') {
      errors.subdomain = 'Please choose an available subdomain';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check subdomain availability
  useEffect(() => {
    if (formData.subdomain.length >= 3) {
      setSubdomainStatus('checking');
      console.log('🔍 Starting subdomain check for:', formData.subdomain);
      
      const timer = setTimeout(() => {
        checkSubdomain(formData.subdomain, {
          onSuccess: (data) => {
            console.log('✅ Subdomain check success:', data);
            console.log('📊 Available status:', data.available);
            setSubdomainStatus(data.available ? 'available' : 'unavailable');
          },
          onError: (error) => {
            console.error('❌ Subdomain check error:', error);
            setSubdomainStatus('unavailable');
          },
        });
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setSubdomainStatus('idle');
    }
  }, [formData.subdomain, checkSubdomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Form submission started with data:', formData);
    
    // Validate form
    if (!validateForm()) {
      console.log('❌ Form validation failed:', formErrors);
      return;
    }
    
    console.log('✅ Form validation passed, submitting...');
    
    register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      organizationName: formData.organizationName,
      subdomain: formData.subdomain,
    });
  };

  const isFormValid = 
    formData.name.trim() &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.organizationName.trim() &&
    formData.subdomain &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 6 &&
    subdomainStatus === 'available' &&
    Object.keys(formErrors).length === 0;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
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
                <p className="text-emerald-100 text-sm">Customer Management Platform</p>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Start your
              <span className="text-yellow-300 block">customer journey</span>
            </h2>
            
            <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
              Join thousands of businesses using ClientSync to manage and grow their customer relationships.
            </p>

            {/* Feature Pills */}
            <div className="space-y-4">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Users className="h-5 w-5 text-blue-300 mr-3" />
                <span className="text-sm">Unlimited customer records</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Zap className="h-5 w-5 text-yellow-300 mr-3" />
                <span className="text-sm">Real-time analytics</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Shield className="h-5 w-5 text-green-300 mr-3" />
                <span className="text-sm">Bank-level security</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-white">10k+</div>
                <div className="text-emerald-200 text-sm">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-emerald-200 text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-40 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-emerald-300/30 rounded-full blur-lg"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 lg:px-8">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="bg-emerald-600 rounded-xl p-3 mr-3">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ClientSync</h1>
              <p className="text-sm text-gray-600">Get Started</p>
            </div>
          </div>

          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900 flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-emerald-600" />
                Create your account
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Start managing your customers in minutes
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
                
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">Personal Information</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, name: e.target.value }));
                            if (formErrors.name) {
                              setFormErrors(prev => ({ ...prev, name: '' }));
                            }
                          }}
                          className={cn(
                            "pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors",
                            formErrors.name && "border-red-300 focus:border-red-500 focus:ring-red-500"
                          )}
                          required
                          disabled={isPending}
                        />
                      </div>
                      {formErrors.name && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, email: e.target.value }));
                            if (formErrors.email) {
                              setFormErrors(prev => ({ ...prev, email: '' }));
                            }
                          }}
                          className={cn(
                            "pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors",
                            formErrors.email && "border-red-300 focus:border-red-500 focus:ring-red-500"
                          )}
                          required
                          disabled={isPending}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Organization Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">Organization Details</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organizationName" className="text-sm font-medium text-gray-700">
                      Organization Name *
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="organizationName"
                        placeholder="Acme Corporation"
                        value={formData.organizationName}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, organizationName: e.target.value }));
                          if (formErrors.organizationName) {
                            setFormErrors(prev => ({ ...prev, organizationName: '' }));
                          }
                        }}
                        className={cn(
                          "pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors",
                          formErrors.organizationName && "border-red-300 focus:border-red-500 focus:ring-red-500"
                        )}
                        required
                        disabled={isPending}
                      />
                    </div>
                    {formErrors.organizationName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {formErrors.organizationName}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subdomain" className="text-sm font-medium text-gray-700">
                      Choose your subdomain *
                    </Label>
                    <div className={cn(
                      "flex rounded-lg overflow-hidden border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-colors",
                      formErrors.subdomain && "border-red-300 focus-within:border-red-500 focus-within:ring-red-500"
                    )}>
                      <Input
                        id="subdomain"
                        placeholder="acme"
                        value={formData.subdomain}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          setFormData(prev => ({ ...prev, subdomain: value }));
                          if (formErrors.subdomain) {
                            setFormErrors(prev => ({ ...prev, subdomain: '' }));
                          }
                        }}
                        className="border-0 rounded-none h-12 focus:ring-0 focus:border-0"
                        required
                        disabled={isPending}
                      />
                      <div className="flex items-center px-4 bg-gray-50 border-l">
                        <span className="text-sm text-gray-600 font-medium">.clientsync.com</span>
                      </div>
                    </div>
                    
                    {formData.subdomain && (
                      <div className="flex items-center gap-2 mt-2">
                        {subdomainStatus === 'checking' && (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            <span className="text-sm text-gray-600">Checking availability...</span>
                          </>
                        )}
                        {subdomainStatus === 'available' && (
                          <>
                            <Check className="h-4 w-4 text-emerald-600" />
                            <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50">
                              Available
                            </Badge>
                          </>
                        )}
                        {subdomainStatus === 'unavailable' && (
                          <>
                            <X className="h-4 w-4 text-red-600" />
                            <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50">
                              Not available
                            </Badge>
                          </>
                        )}
                      </div>
                    )}
                    
                    {formErrors.subdomain && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {formErrors.subdomain}
                      </p>
                    )}
                  </div>
                </div>

                {/* Security */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">Security</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create password"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, password: e.target.value }));
                            if (formErrors.password) {
                              setFormErrors(prev => ({ ...prev, password: '' }));
                            }
                          }}
                          className={cn(
                            "pl-10 pr-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors",
                            formErrors.password && "border-red-300 focus:border-red-500 focus:ring-red-500"
                          )}
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
                      {formErrors.password && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                            if (formErrors.confirmPassword) {
                              setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }
                          }}
                          className={cn(
                            "pl-10 pr-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors",
                            formErrors.confirmPassword && "border-red-300 focus:border-red-500 focus:ring-red-500"
                          )}
                          required
                          disabled={isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isPending}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="px-6 pt-4 pb-6">
                <div className="w-full space-y-4">
                  <Button 
                    type="submit" 
                    className={cn(
                      "w-full h-12 font-medium transition-all duration-200 shadow-lg hover:shadow-xl group",
                      isFormValid 
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                    disabled={isPending || !isFormValid}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Already have an account? </span>
                    <Link 
                      href="/login" 
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Sign in instead
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our 
              <Link href="/terms" className="hover:text-gray-700 transition-colors mx-1">
                Terms of Service
              </Link>
              and
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