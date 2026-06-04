import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pcevcippzwnsmrsbiaqc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZXZjaXBwenduc21yc2JpYXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTY2NTAsImV4cCI6MjA5NTk5MjY1MH0.tcB2OrDnudBoGl50j3zpUdu0M-eP5Xty-JwARFx_vLA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
