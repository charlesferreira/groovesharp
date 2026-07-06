import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Backend configurado? Sem env, o app roda 100% local (sem contas/sync), como antes. */
export const supabaseEnabled = Boolean(url && anonKey)

/** Cliente Supabase (tipado pelo schema), ou null quando o backend não está configurado. */
export const supabase: SupabaseClient<Database> | null = supabaseEnabled
  ? createClient<Database>(url as string, anonKey as string)
  : null
