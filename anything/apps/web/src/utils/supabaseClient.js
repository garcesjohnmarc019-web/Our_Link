import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rsnajdzebkradayzuijl.supabase.co";
const supabaseKey = "sb_publishable_dbsKg9xXvF4BLFEWsG3N7g_YVCLC67V";

export const supabase = createClient(supabaseUrl, supabaseKey);