
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mxxxezsrlfecegpfychw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHhlenNybGZlY2VncGZ5Y2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2Nzk5OTYsImV4cCI6MjA1MDI1NTk5Nn0.Oufc-C_5f0e37Yep6bSGallulNKOdZQkDR7NolonLyE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
  }
});
