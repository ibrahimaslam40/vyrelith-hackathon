import 'server-only'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const secretKey = process.env.SUPABASE_SECRET_KEY

if (!url || !secretKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set')
}

// Secret key bypasses RLS — this client must never be imported into a
// Client Component or exposed to the browser. Every table has RLS enabled
// with no policies, so this is the only key that can read or write data.
export const supabase = createClient(url, secretKey, {
  auth: { persistSession: false },
})
