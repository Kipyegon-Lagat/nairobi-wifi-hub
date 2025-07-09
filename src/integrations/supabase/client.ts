import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnrjfgqjhoyeigqlgdze.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucmpxZ2pob3llaWdxbGdkemUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjMyODc3NSwiZXhwIjoyMDUxOTA0Nzc1fQ.WQRR8E69i5bhkHOr1CsBWKpg0p4UdNhN0oCpzOqe-8o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);