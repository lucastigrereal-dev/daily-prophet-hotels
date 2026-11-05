import { publicConfig } from './supabase/config'
// Cliente Supabase
// Daily Prophet - Instituto Rodovansky

import { createClient } from '@supabase/supabase-js';

const { url: supabaseUrl, key: supabaseAnonKey } = publicConfig();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
