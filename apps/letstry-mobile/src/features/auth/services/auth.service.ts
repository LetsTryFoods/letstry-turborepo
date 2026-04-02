import { client } from '../../../lib/apollo-client';
import { LOGIN_MUTATION } from '../../../lib/graphql/auth';
import type { LoginFormValues } from '../schemas/auth.schema';
import type { LoginResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (input: LoginFormValues): Promise<LoginResponse> => {
  const { data } = await client.mutate<{ login: LoginResponse }>({
    mutation: LOGIN_MUTATION,
    variables: { input },
  });
  const result = data!.login;
  // Persist token for subsequent requests
  await AsyncStorage.setItem('access_token', result.accessToken);
  return result;
};
