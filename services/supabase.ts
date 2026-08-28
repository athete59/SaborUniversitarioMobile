import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlqetyyjvlzeedgrfzpt.supabase.co';
const supabaseAnonKey = 'sb_publishable_pRt6jTFxddlEqvwToCr8Rg_dyITNN7f';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});