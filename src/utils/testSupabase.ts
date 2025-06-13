import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('meetings').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful!', data);
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
};

export const testSupabaseAuth = async () => {
  try {
    console.log('Testing Supabase auth...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase auth error:', error);
      return false;
    }
    
    console.log('Supabase auth test successful!', { hasSession: !!session });
    return true;
  } catch (error) {
    console.error('Supabase auth test failed:', error);
    return false;
  }
};
