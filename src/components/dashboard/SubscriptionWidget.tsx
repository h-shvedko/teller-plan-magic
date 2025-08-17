import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, CreditCard, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionWidget = () => {
  const { 
    subscription, 
    isLoading, 
    error, 
    openCustomerPortal, 
    createCheckout,
    isSubscribed,
    subscriptionTier,
    subscriptionEnd 
  } = useSubscription();
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = async (plan: string) => {
    try {
      await createCheckout(plan);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
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

  const subscriptionEndDate = subscriptionEnd ? new Date(subscriptionEnd) : null;
  const daysUntilRenewal = subscriptionEndDate 
    ? Math.ceil((subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const isExpiringSoon = daysUntilRenewal <= 7 && daysUntilRenewal > 0;

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
            {subscriptionTier}
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
            onClick={handleManageSubscription} 
            variant="outline" 
            className="flex-1"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};