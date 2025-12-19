'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { useLogin, LoginData } from '@/lib/login/useLogin'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>()
  const [login, { loading }] = useLogin()

  const onSubmit = async (data: LoginData) => {
    try {
      const response = await login({
        variables: {
          email: data.email.toLocaleLowerCase(),
          password: data.password
        }
      })

      const token = (response.data as any)?.adminLogin
      
      if (token) {
        toast.success('Login successful!')
        window.location.href = '/dashboard'
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your admin credentials to access the dashboard
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
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <a href="/auth/register" className="text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}