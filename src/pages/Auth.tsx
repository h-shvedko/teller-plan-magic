import { useState, useEffect } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [selectedPlan, setSelectedPlan] = useState<string>('free');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) {
      setSelectedPlan(plan);
      setActiveTab('signup');
    }
  }, [searchParams]);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    setIsLoading(false);
    
    if (!error) {
      // Navigation will happen automatically via auth state change
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(email, password, firstName, lastName);
    
    setIsLoading(false);
    
    if (!error) {
      if (selectedPlan && selectedPlan !== 'free') {
        await handleSubscription(selectedPlan);
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        setActiveTab('signin');
      }
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    }
  };

  const handleSubscription = async (plan: string) => {
    try {
      // First, save subscription info to database
      await supabase.from('subscribers').upsert({
        user_id: user?.id,
        email: user?.email || email,
        subscribed: plan !== 'free',
        subscription_tier: plan,
        subscription_end: plan !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      }, { onConflict: 'user_id' });

      if (plan !== 'free') {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { plan }
        });

        if (error) throw error;
        
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to payment",
          description: "Opening Stripe checkout in a new tab...",
        });
      } else {
        toast({
          title: "Welcome to TellerPlan!",
          description: "Your free account is ready to use.",
        });
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to set up subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '€0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Up to 5 meal plans',
        '3 recipes per week',
        'Basic shopping lists',
        'Essential features'
      ],
      badge: selectedPlan === 'free' ? 'Selected' : null,
      badgeColor: 'bg-green-500'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '€7.99',
      period: 'per month',
      description: 'Great for serious learners',
      features: [
        'Unlimited meal plans',
        'Premium recipes',
        'Advanced shopping lists',
        'AI recommendations',
        'Priority support'
      ],
      badge: selectedPlan === 'pro' ? 'Selected' : 'Popular',
      badgeColor: selectedPlan === 'pro' ? 'bg-green-500' : 'bg-purple-500'
    },
    {
      id: 'family',
      name: 'Family',
      price: '€12.99',
      period: 'per month',
      description: 'Best for families',
      features: [
        'Everything in Pro',
        'Family meal planning',
        'Multiple users',
        'Bulk shopping lists',
        'All study modes',
        'Premium support'
      ],
      badge: selectedPlan === 'family' ? 'Selected' : null,
      badgeColor: 'bg-green-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Join TellerPlan - Smart Meal Planning</title>
        <meta name="description" content="Join TellerPlan to start your personalized meal planning journey. Choose the plan that fits your needs." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to TellerPlan
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your personalized meal planning companion
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-10 pb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-white">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white">
                    Get Started
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4 mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-gray-700 font-medium">
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-gray-300 focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-gray-700 font-medium">
                        Password
                      </Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-gray-300 focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-6 mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-gray-700 font-medium">
                        Name (optional)
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          id="signup-firstname"
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="border-gray-300 focus:border-primary focus:ring-primary"
                        />
                        <Input
                          id="signup-lastname"
                          type="text"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="border-gray-300 focus:border-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-700 font-medium">
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-gray-300 focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-700 font-medium">
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-gray-300 focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>

                    {/* Plan Selection */}
                    <div className="pt-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Choose Your Plan</h3>
                        <p className="text-sm text-gray-600">Select the plan that fits your cooking goals</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                          <div
                            key={plan.id}
                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              selectedPlan === plan.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedPlan(plan.id)}
                          >
                            {plan.badge && (
                              <Badge 
                                className={`absolute -top-2 left-4 text-white text-xs px-2 py-1 ${plan.badgeColor}`}
                              >
                                {plan.badge}
                              </Badge>
                            )}
                            
                            <div className="text-center">
                              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3">
                                <span className="text-blue-600 text-lg font-bold">
                                  {plan.name.charAt(0)}
                                </span>
                              </div>
                              
                              <h4 className="font-semibold text-gray-900 mb-1">{plan.name}</h4>
                              <p className="text-xs text-gray-600 mb-3">{plan.description}</p>
                              
                              <div className="mb-4">
                                <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                                <span className="text-sm text-gray-600 block">{plan.period}</span>
                              </div>
                              
                              <ul className="text-xs text-gray-600 space-y-2 text-left">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Check className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 text-center mt-4">
                        You can change your plan anytime. Free plan requires no payment.
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 text-base font-medium mt-6" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Start My Meal Journey"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Auth;