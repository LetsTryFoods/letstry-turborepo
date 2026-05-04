import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_PRESS_MENTIONS,
  GET_ACTIVE_PRESS_MENTIONS,
  GET_PRESS_MENTION,
  GET_PRESS_MENTION_BY_SLUG,
  CREATE_PRESS_MENTION,
  UPDATE_PRESS_MENTION,
  REMOVE_PRESS_MENTION,
} from "@/lib/graphql/press-mentions";

export interface PressMention {
  _id: string;
  slug: string;
  publication: string;
  publicationLogoUrl?: string;
  headline: string;
  url: string;
  excerpt?: string;
  coverImageUrl?: string;
  publishedAt: string;
  category?: string;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePressMentionInput {
  slug: string;
  publication: string;
  publicationLogoUrl?: string;
  headline: string;
  url: string;
  excerpt?: string;
  coverImageUrl?: string;
  publishedAt: string;
  category?: string;
  isActive?: boolean;
  position?: number;
}

export type UpdatePressMentionInput = Partial<CreatePressMentionInput>;

export const usePressMentions = () =>
  useQuery(GET_PRESS_MENTIONS, { fetchPolicy: "cache-and-network" });

export const useActivePressMentions = () =>
  useQuery(GET_ACTIVE_PRESS_MENTIONS, { fetchPolicy: "cache-and-network" });

export const usePressMention = (id: string) =>
  useQuery(GET_PRESS_MENTION, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });

export const usePressMentionBySlug = (slug: string) =>
  useQuery(GET_PRESS_MENTION_BY_SLUG, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: "cache-and-network",
  });

export const useCreatePressMention = () => {
  const [mutate, state] = useMutation(CREATE_PRESS_MENTION, {
    refetchQueries: [{ query: GET_PRESS_MENTIONS }],
  });
  return {
    create: (input: CreatePressMentionInput) =>
      mutate({ variables: { input } }),
    ...state,
  };
};

export const useUpdatePressMention = () => {
  const [mutate, state] = useMutation(UPDATE_PRESS_MENTION, {
    refetchQueries: [{ query: GET_PRESS_MENTIONS }],
  });
  return {
    update: (id: string, input: UpdatePressMentionInput) =>
      mutate({ variables: { id, input } }),
    ...state,
  };
};

export const useRemovePressMention = () => {
  const [mutate, state] = useMutation(REMOVE_PRESS_MENTION, {
    refetchQueries: [{ query: GET_PRESS_MENTIONS }],
  });
  return {
    remove: (id: string) => mutate({ variables: { id } }),
    ...state,
  };
};
