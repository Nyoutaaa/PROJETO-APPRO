import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xtdozoxsbvbitspkuaek.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZG96b3hzYnZiaXRzcGt1YWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzOTAzMjYsImV4cCI6MjA2MDk2NjMyNn0.lGpdOSVVmrMSwJUIJgdikgEN2a0NKL1Pu4F43TDv5-I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 