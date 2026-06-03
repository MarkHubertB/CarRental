const FALLBACK_SUPABASE_URL = 'https://placeholder.supabase.co'
const FALLBACK_SUPABASE_KEY = 'placeholder-anon-key'

function readEnv(name: string) {
  return process.env[name]?.trim()
}

function reportMissingEnv(names: string[]) {
  const message = `Missing Supabase environment variable${
    names.length === 1 ? '' : 's'
  }: ${names.join(', ')}`

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(message)
  }

  console.error(message)
}

export function getSupabasePublicEnv() {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const missing = ([
    ['NEXT_PUBLIC_SUPABASE_URL', url],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', anonKey],
  ] as Array<[string, string | undefined]>)
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missing.length > 0) {
    reportMissingEnv(missing)
  }

  return {
    url: url ?? FALLBACK_SUPABASE_URL,
    anonKey: anonKey ?? FALLBACK_SUPABASE_KEY,
    isConfigured: missing.length === 0,
  }
}

export function getSupabaseAdminEnv() {
  const { url } = getSupabasePublicEnv()
  const serviceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY')

  if (!serviceRoleKey) {
    reportMissingEnv(['SUPABASE_SERVICE_ROLE_KEY'])
  }

  return {
    url,
    serviceRoleKey: serviceRoleKey ?? FALLBACK_SUPABASE_KEY,
    isConfigured: Boolean(serviceRoleKey),
  }
}
