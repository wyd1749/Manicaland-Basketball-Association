import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bzormjralprnswvyyocc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6b3JtanJhbHBybnN3dnl5b2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzA4NDgsImV4cCI6MjA5MzU0Njg0OH0.C8aYPdWwQ4uld-xFR3YLlZHvpfnQBwwRLOlrUSN5eYY'

export const supabase = createClient(supabaseUrl, supabaseKey)