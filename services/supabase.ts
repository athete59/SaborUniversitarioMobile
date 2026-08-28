import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://xlqetyyjvlzeedgrfzpt.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscWV0eXlqdmx6ZWVkZ3JmenB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTE4MjcsImV4cCI6MjA5Nzk4NzgyN30.fpWxAZXoWBxfugDIa4Nph1BNXYYM1QCovqQBPI-22Ls";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
