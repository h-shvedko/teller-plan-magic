-- Create payments table to track subscription payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'canceled', 'failed')),
  plan_type TEXT NOT NULL, -- free, pro, family
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscribers table to track subscription status
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
FOR SELECT
USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Admins can manage payments" ON public.payments
FOR ALL
USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Edge functions can insert payments" ON public.payments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Edge functions can update payments" ON public.payments
FOR UPDATE
USING (true);

-- Create policies for subscribers
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT
USING (auth.uid() = user_id OR email = auth.email());

CREATE POLICY "Admins can view all subscriptions" ON public.subscribers
FOR SELECT
USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Users can update their own subscription" ON public.subscribers
FOR UPDATE
USING (auth.uid() = user_id OR email = auth.email());

CREATE POLICY "Edge functions can manage subscriptions" ON public.subscribers
FOR ALL
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();