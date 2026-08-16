// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'

import {
  AUTH_SESSION_KEY,
  DEFAULT_PASSWORD,
  DEFAULT_USERNAME,
  clearAuthentication,
  createAuthGuard,
  isAuthenticated,
  login,
  resolvePostLoginPath
} from '../auth'

describe('authentication service', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('accepts only the documented default credentials and stores the session', () => {
    expect(login(DEFAULT_USERNAME, 'wrong')).toBe(false)
    expect(isAuthenticated()).toBe(false)

    expect(login(DEFAULT_USERNAME, DEFAULT_PASSWORD)).toBe(true)
    expect(sessionStorage.getItem(AUTH_SESSION_KEY)).toBe('authenticated')
    expect(isAuthenticated()).toBe(true)
  })

  it('clears authentication on logout', () => {
    login(DEFAULT_USERNAME, DEFAULT_PASSWORD)
    clearAuthentication()

    expect(isAuthenticated()).toBe(false)
  })

  it('protects business routes and preserves the requested address', () => {
    const guard = createAuthGuard(() => false)

    expect(guard({ name: 'task', fullPath: '/task?view=list', meta: {} })).toEqual({
      name: 'login',
      query: { redirect: '/task?view=list' }
    })
    expect(guard({ name: 'login', fullPath: '/login', meta: { public: true } })).toBe(true)
  })

  it('keeps authenticated users out of the login route', () => {
    const guard = createAuthGuard(() => true)

    expect(guard({ name: 'login', fullPath: '/login', meta: { public: true } })).toEqual({
      name: 'workSpace'
    })
    expect(guard({ name: 'task', fullPath: '/task', meta: {} })).toBe(true)
  })

  it('accepts only safe internal post-login paths', () => {
    expect(resolvePostLoginPath('/task?view=list')).toBe('/task?view=list')
    expect(resolvePostLoginPath('//example.com')).toBe('/')
    expect(resolvePostLoginPath('/login')).toBe('/')
    expect(resolvePostLoginPath('https://example.com')).toBe('/')
    expect(resolvePostLoginPath(undefined)).toBe('/')
  })
})

