export const DEFAULT_USERNAME = 'admin'
export const DEFAULT_PASSWORD = '123456'
export const AUTH_SESSION_KEY = 'sts-auth-session'

const AUTHENTICATED_VALUE = 'authenticated'

const getSessionStorage = () => {
  try {
    return typeof window === 'undefined' ? undefined : window.sessionStorage
  } catch {
    return undefined
  }
}

export const isAuthenticated = () =>
  getSessionStorage()?.getItem(AUTH_SESSION_KEY) === AUTHENTICATED_VALUE

export const login = (username, password) => {
  const credentialsAreValid =
    String(username ?? '').trim() === DEFAULT_USERNAME &&
    String(password ?? '') === DEFAULT_PASSWORD

  if (!credentialsAreValid) return false

  getSessionStorage()?.setItem(AUTH_SESSION_KEY, AUTHENTICATED_VALUE)
  return true
}

export const clearAuthentication = () => {
  getSessionStorage()?.removeItem(AUTH_SESSION_KEY)
}

export const resolvePostLoginPath = (candidate) => {
  if (typeof candidate !== 'string') return '/'

  const path = candidate.trim()
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '/'

  try {
    const parsed = new URL(path, 'https://local.spacetaskscheduler')
    if (parsed.origin !== 'https://local.spacetaskscheduler' || parsed.pathname === '/login') return '/'
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return '/'
  }
}

export const createAuthGuard = (checkAuthentication = isAuthenticated) => (to) => {
  const authenticated = checkAuthentication()

  if (to.name === 'login') {
    return authenticated ? { name: 'workSpace' } : true
  }

  if (to.meta?.public === true) return true
  if (authenticated) return true

  return {
    name: 'login',
    query: { redirect: resolvePostLoginPath(to.fullPath) }
  }
}
