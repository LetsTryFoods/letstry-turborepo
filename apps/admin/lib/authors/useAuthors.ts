import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_AUTHORS,
  GET_ACTIVE_AUTHORS,
  GET_TEAM_MEMBERS,
  GET_AUTHOR,
  GET_AUTHOR_BY_SLUG,
  CREATE_AUTHOR,
  UPDATE_AUTHOR,
  REMOVE_AUTHOR,
} from "@/lib/graphql/authors";

export interface AuthorSocialLink {
  platform: string;
  url: string;
}

export interface Author {
  _id: string;
  slug: string;
  name: string;
  jobTitle?: string;
  bio?: string;
  photoUrl?: string;
  publicEmail?: string;
  expertise: string[];
  credentials: string[];
  socialLinks: AuthorSocialLink[];
  isFounder: boolean;
  isTeamMember: boolean;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAuthorInput {
  slug: string;
  name: string;
  jobTitle?: string;
  bio?: string;
  photoUrl?: string;
  publicEmail?: string;
  expertise?: string[];
  credentials?: string[];
  socialLinks?: AuthorSocialLink[];
  isFounder?: boolean;
  isTeamMember?: boolean;
  isActive?: boolean;
  position?: number;
}

export type UpdateAuthorInput = Partial<CreateAuthorInput>;

export const useAuthors = () =>
  useQuery(GET_AUTHORS, { fetchPolicy: "cache-and-network" });
export const useActiveAuthors = () =>
  useQuery(GET_ACTIVE_AUTHORS, { fetchPolicy: "cache-and-network" });
export const useTeamMembers = () =>
  useQuery(GET_TEAM_MEMBERS, { fetchPolicy: "cache-and-network" });
export const useAuthor = (id: string) =>
  useQuery(GET_AUTHOR, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });
export const useAuthorBySlug = (slug: string) =>
  useQuery(GET_AUTHOR_BY_SLUG, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: "cache-and-network",
  });

export const useCreateAuthor = () => {
  const [mutate, state] = useMutation(CREATE_AUTHOR, {
    refetchQueries: [{ query: GET_AUTHORS }],
  });
  return {
    create: (input: CreateAuthorInput) => mutate({ variables: { input } }),
    ...state,
  };
};

export const useUpdateAuthor = () => {
  const [mutate, state] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: GET_AUTHORS }],
  });
  return {
    update: (id: string, input: UpdateAuthorInput) =>
      mutate({ variables: { id, input } }),
    ...state,
  };
};

export const useRemoveAuthor = () => {
  const [mutate, state] = useMutation(REMOVE_AUTHOR, {
    refetchQueries: [{ query: GET_AUTHORS }],
  });
  return { remove: (id: string) => mutate({ variables: { id } }), ...state };
};
