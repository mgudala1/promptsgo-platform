// Test Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uvewqhtfmjopqhidbdwc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2ZXdxaHRmbWpvcHFoaWRiZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDY2ODMsImV4cCI6MjA3NTA4MjY4M30.8kYnvOmaXnllBA5beWPsO3m7RPYg3TPIgnUKZmhq5lU'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')

    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)

    if (error) {
      console.error('Supabase connection failed:', error)
      return false
    }

    console.log('Supabase connection successful!')
    return true
  } catch (err) {
    console.error('Connection test failed:', err)
    return false
  }
}

testConnection()