import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kpzhiwyfxnojdzbwerra.supabase.co'
const supabaseAnonKey = 'sb_publishable_1_-HILQEAHy_20e_JdzYrw_tlA-9KkK'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
