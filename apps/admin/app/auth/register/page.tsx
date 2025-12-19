'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { useRegister, RegisterData } from '@/lib/register/useRegister'

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>()
  const [registerMutation, { loading }] = useRegister()

  const onSubmit = async (data: RegisterData) => {
    try {
      const response = await registerMutation({
        variables: {
          email: data.email.toLowerCase(),
          password: data.password
        }
      })

      console.log('Register response:', response)
      toast.success('Registration successful!')
      window.location.href = '/auth/login'
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.message || 'Registration failed'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Admin Account</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to create an admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}