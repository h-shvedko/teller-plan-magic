import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Crown, CreditCard, Calendar, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

interface PaymentStatus {
  has_pending_payment: boolean;
  pending_plan: string | null;
}

export const SubscriptionWidget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setPaymentStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load subscription data
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSubscription(data);
      } else {
        // No subscription record found, create default free subscription
        const { error: insertError } = await supabase
          .from('subscribers')
          .insert({
            user_id: user.id,
            email: user.email || '',
            subscribed: false,
            subscription_tier: 'free',
            subscription_end: null
          });

        if (!insertError) {
          setSubscription({
            subscribed: false,
            subscription_tier: 'free',
            subscription_end: null
          });
        }
      }

      // Check for pending payments
      const { data: pendingPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('plan_type')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!paymentsError && pendingPayments && pendingPayments.length > 0) {
        setPaymentStatus({
          has_pending_payment: true,
          pending_plan: pendingPayments[0].plan_type
        });
      } else {
        setPaymentStatus({
          has_pending_payment: false,
          pending_plan: null
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to load subscription');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const handleUpgrade = async (plan: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upgrade",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to payment",
          description: "Opening Stripe checkout in a new tab...",
        });
        
        // Refresh data after a short delay to show pending payment
        setTimeout(() => {
          loadSubscription();
        }, 2000);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load subscription information. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  const subscriptionEndDate = subscription?.subscription_end ? new Date(subscription.subscription_end) : null;
  const daysUntilRenewal = subscriptionEndDate 
    ? Math.ceil((subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const isExpiringSoon = daysUntilRenewal <= 7 && daysUntilRenewal > 0;
  const isSubscribed = subscription?.subscribed || false;
  const hasPendingPayment = paymentStatus?.has_pending_payment || false;

  // Show pending payment warning for non-subscribed users
  if (!isSubscribed && hasPendingPayment) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Payment Pending
            <Badge variant="outline" className="ml-auto border-yellow-600 text-yellow-600">
              {paymentStatus?.pending_plan || 'Unknown'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Your payment is being processed. Access will be granted once payment is confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Premium features are locked until payment is completed. 
              Please complete your payment to access all features.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleUpgrade(paymentStatus?.pending_plan || 'pro')} 
              variant="default" 
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Complete Payment
            </Button>
            <Button 
              onClick={loadSubscription} 
              variant="outline"
            >
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSubscribed) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Upgrade Your Plan
          </CardTitle>
          <CardDescription>
            You're currently on the free plan. Upgrade to unlock premium features!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={() => handleUpgrade('pro')} 
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <span className="font-semibold">Pro Plan</span>
              <span className="text-xs text-muted-foreground">$7.99/month</span>
            </Button>
            <Button 
              onClick={() => handleUpgrade('family')} 
              variant="outline"
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <span className="font-semibold">Family Plan</span>
              <span className="text-xs text-muted-foreground">$12.99/month</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isExpiringSoon ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Your Subscription
          <Badge variant="secondary" className="ml-auto">
            {subscription?.subscription_tier || 'Free'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage your subscription and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isExpiringSoon && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your subscription expires in {daysUntilRenewal} day{daysUntilRenewal === 1 ? '' : 's'}
            </AlertDescription>
          </Alert>
        )}
        
        {subscriptionEndDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {daysUntilRenewal > 0 
                ? `Renews on ${subscriptionEndDate.toLocaleDateString()}`
                : `Expired on ${subscriptionEndDate.toLocaleDateString()}`
              }
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={() => handleUpgrade('pro')} 
            variant="outline" 
            className="flex-1"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
          <Button 
            onClick={openCustomerPortal} 
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};