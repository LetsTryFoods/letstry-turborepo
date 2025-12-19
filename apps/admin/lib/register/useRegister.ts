import { useMutation } from '@apollo/client/react'
import { ADMIN_REGISTER } from '@/lib/graphql/auth'

export interface RegisterData {
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
  user: any
}

export const useRegister = () => {
  const [mutate, { data, loading, error }] = useMutation(ADMIN_REGISTER, {
    onCompleted: (data: any) => {
      console.log('Registration successful:', data.createAdmin)
    },
    onError: (error: any) => {
      console.error('Registration error:', error)
    }
  })
  
  return [mutate, { data, loading, error }] as const
}