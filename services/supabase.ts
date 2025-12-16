import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION: DIRECTLY ENTER YOUR SUPABASE CREDENTIALS BELOW
// ------------------------------------------------------------------

const supabaseUrl = 'https://dlfuuiduinzytnrnythb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZnV1aWR1aW56eXRucm55dGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODg3NTEsImV4cCI6MjA4MTQ2NDc1MX0.Gy_IrCjsvGkjck-9YPLnEP-q01MUtY9_dzJmtzgIp1E';

// ------------------------------------------------------------------

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);