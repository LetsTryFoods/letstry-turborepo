"use client";

import { useMutation } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql/client-factory";
import { UPDATE_USER_MUTATION } from "@/lib/queries/auth";

interface UpdateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: Date;
}

interface UseUpdateUserReturn {
  updateUser: (input: UpdateUserInput) => void;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateUser(onSuccess?: () => void): UseUpdateUserReturn {
  const {
    mutate: updateUserMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      const response = await graphqlClient.request(UPDATE_USER_MUTATION, {
        input,
      });
      return response.updateUser;
    },
    onSuccess,
  });

  return {
    updateUser: updateUserMutation,
    isPending,
    error: error as Error | null,
  };
}
