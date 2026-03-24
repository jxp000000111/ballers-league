import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ccyuodbeezbvprhgjpko.supabase.co";
const supabaseAnonKey = "sb_publishable_ud_KIbWXA3W9HLIFPpur7g_Ir1_oOWZ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
