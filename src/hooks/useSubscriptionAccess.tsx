import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionAccess {
  isSubscribed: boolean;
  subscriptionTier: string | null;
  hasPendingPayment: boolean;
  isLoading: boolean;
  canAccessFeature: (feature: string) => boolean;
}

export const useSubscriptionAccess = (): SubscriptionAccess => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setIsSubscribed(false);
        setSubscriptionTier(null);
        setHasPendingPayment(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Check subscription status
        const { data: subscription } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_tier')
          .eq('user_id', user.id)
          .maybeSingle();

        // Check for pending payments
        const { data: pendingPayments } = await supabase
          .from('payments')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .limit(1);

        setIsSubscribed(subscription?.subscribed || false);
        setSubscriptionTier(subscription?.subscription_tier || 'free');
        setHasPendingPayment((pendingPayments?.length || 0) > 0);
      } catch (error) {
        console.error('Error checking subscription access:', error);
        setIsSubscribed(false);
        setSubscriptionTier('free');
        setHasPendingPayment(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user]);

  const canAccessFeature = (feature: string): boolean => {
    // Free features available to everyone
    const freeFeatures = ['recipes', 'basic-meal-plans'];
    if (freeFeatures.includes(feature)) return true;

    // If user has pending payment for a premium plan, deny access
    if (hasPendingPayment && subscriptionTier !== 'free') return false;

    // Premium features require active subscription
    const premiumFeatures = ['advanced-meal-plans', 'custom-recipes', 'shopping-lists', 'preferences'];
    if (premiumFeatures.includes(feature)) {
      return isSubscribed && subscriptionTier !== 'free';
    }

    // Family features require family plan
    const familyFeatures = ['family-meal-plans', 'multiple-profiles'];
    if (familyFeatures.includes(feature)) {
      return isSubscribed && subscriptionTier === 'family';
    }

    return false;
  };

  return {
    isSubscribed,
    subscriptionTier,
    hasPendingPayment,
    isLoading,
    canAccessFeature,
  };
};