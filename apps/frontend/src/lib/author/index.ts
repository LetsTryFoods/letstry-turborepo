import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_AUTHOR_BY_SLUG, GET_TEAM_MEMBERS, GET_ACTIVE_AUTHORS } from '@/lib/queries/authors';

export interface AuthorSocialLink {
  platform: string;
  url: string;
}

export interface Author {
  _id: string;
  slug: string;
  name: string;
  jobTitle?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  publicEmail?: string | null;
  expertise: string[];
  credentials: string[];
  socialLinks: AuthorSocialLink[];
  isFounder: boolean;
  isTeamMember: boolean;
  isActive: boolean;
  position: number;
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<{ authorBySlug: Author }>(GET_AUTHOR_BY_SLUG, { slug });
    return data?.authorBySlug ?? null;
  } catch (e) {
    console.error('getAuthorBySlug failed', e);
    return null;
  }
}

export async function getTeamMembers(): Promise<Author[]> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<{ teamMembers: Author[] }>(GET_TEAM_MEMBERS);
    return data?.teamMembers ?? [];
  } catch (e) {
    console.error('getTeamMembers failed', e);
    return [];
  }
}

export async function getActiveAuthors(): Promise<Author[]> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<{ activeAuthors: Author[] }>(GET_ACTIVE_AUTHORS);
    return data?.activeAuthors ?? [];
  } catch (e) {
    console.error('getActiveAuthors failed', e);
    return [];
  }
}
