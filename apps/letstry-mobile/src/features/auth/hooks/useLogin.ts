import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../services/auth.service';
import type { LoginFormValues } from '../schemas/auth.schema';

export const useLogin = () => {
  return useMutation({
    mutationFn: (input: LoginFormValues) => loginUser(input),
    onError: (error) => {
      console.warn('[useLogin] Error:', error);
    },
  });
};
