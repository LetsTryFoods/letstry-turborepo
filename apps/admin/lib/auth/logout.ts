import { clearAuthData } from './token-service'

export const handleLogout = (): void => {
  clearAuthData()
  window.location.href = '/auth/login'
}
