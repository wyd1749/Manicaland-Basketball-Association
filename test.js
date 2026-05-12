const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bzormjralprnswvyyocc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6b3JtanJhbHBybnN3dnl5b2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDg0OCwiZXhwIjoyMDkzNTQ2ODQ4fQ.C8aYPdWwQ4uld-xFR3YLlZHvpfnQBwwRLOlrUSN5eYY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('teams').select('*')
  if (error) {
    console.log('❌ Error:', error.message)
  } else {
    console.log('✅ Connected! Teams:', data)
  }
}

test()