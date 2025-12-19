import { isTokenExpired } from './jwt-utils'

export const getValidTokenServer = (cookieToken?: string): string | null => {
  if (!cookieToken) return null
  
  if (isTokenExpired(cookieToken)) {
    return null
  }
  
  return cookieToken
}
