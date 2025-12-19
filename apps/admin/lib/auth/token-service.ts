import { isTokenExpired } from './jwt-utils'

export const getValidToken = (): string | null => {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('token')
  if (!token) return null
  
  if (isTokenExpired(token)) {
    clearAuthData()
    return null
  }
  
  return token
}

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('token')
  document.cookie = 'token=; path=/; max-age=0'
}

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('token', token)
  document.cookie = `token=${token}; path=/; max-age=86400`
}

export const redirectToLogin = (): void => {
  if (typeof window === 'undefined') return
  
  clearAuthData()
  window.location.href = '/auth/login'
}
