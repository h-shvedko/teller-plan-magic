-- Create table for tracking OpenAI API calls
CREATE TABLE public.openai_api_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  model_used TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.openai_api_calls ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all OpenAI API calls" 
ON public.openai_api_calls 
FOR SELECT 
USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Admins can manage OpenAI API calls" 
ON public.openai_api_calls 
FOR ALL 
USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Users can view their own OpenAI API calls" 
ON public.openai_api_calls 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can insert API call logs" 
ON public.openai_api_calls 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Edge functions can update API call logs" 
ON public.openai_api_calls 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_openai_api_calls_updated_at
BEFORE UPDATE ON public.openai_api_calls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_openai_api_calls_user_id ON public.openai_api_calls(user_id);
CREATE INDEX idx_openai_api_calls_function_name ON public.openai_api_calls(function_name);
CREATE INDEX idx_openai_api_calls_status ON public.openai_api_calls(status);
CREATE INDEX idx_openai_api_calls_created_at ON public.openai_api_calls(created_at DESC);