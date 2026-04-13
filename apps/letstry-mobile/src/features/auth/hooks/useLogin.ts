import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../services/auth.service';
import type { LoginFormValues } from '../schemas/auth.schema';
import AuthLogger from '../../../lib/utils/auth-logger';

export const useLogin = () => {
  return useMutation({
    mutationFn: (input: LoginFormValues) => loginUser(input),
    onError: (error) => {
      AuthLogger.warn('useLogin Mutation Error:', error);
    },
  });
};
