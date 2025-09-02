import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SettingsData {
  cuisines: Array<{ id: string; name: string; description?: string }>;
  dietaryPreferences: Array<{ id: string; name: string; description?: string }>;
  healthGoals: Array<{ id: string; name: string; description?: string }>;
  cookingStyles: Array<{ id: string; name: string; description?: string }>;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    cuisines: [],
    dietaryPreferences: [],
    healthGoals: [],
    cookingStyles: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const [cuisinesResult, dietaryResult, goalsResult, stylesResult] = await Promise.all([
          supabase.from('cuisines').select('*').order('name'),
          supabase.from('dietary_preferences').select('*').order('name'),
          supabase.from('health_goals').select('*').order('name'),
          supabase.from('cooking_styles').select('*').order('name')
        ]);

        if (cuisinesResult.error) throw cuisinesResult.error;
        if (dietaryResult.error) throw dietaryResult.error;
        if (goalsResult.error) throw goalsResult.error;
        if (stylesResult.error) throw stylesResult.error;

        setSettings({
          cuisines: cuisinesResult.data || [],
          dietaryPreferences: dietaryResult.data || [],
          healthGoals: goalsResult.data || [],
          cookingStyles: stylesResult.data || []
        });
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { settings, loading, error, refetch: () => window.location.reload() };
};