import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pxcbormesnjafhcfmcrj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4Y2Jvcm1lc25qYWZoY2ZtY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDQ1ODMsImV4cCI6MjEwMjAyMDU4M30.6aNftszMVL_uYFtERbjcLphb4o8caAdUCxkUgvxjK2Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
