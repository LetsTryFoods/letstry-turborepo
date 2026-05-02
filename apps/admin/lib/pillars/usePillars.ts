import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_PILLARS,
  GET_ACTIVE_PILLARS,
  GET_PILLAR,
  GET_PILLAR_BY_SLUG,
  CREATE_PILLAR,
  UPDATE_PILLAR,
  REMOVE_PILLAR,
} from "@/lib/graphql/pillars";

export interface PillarCategoryTile {
  categorySlug: string;
  name: string;
  blurb: string;
}

export interface PillarSection {
  heading: string;
  body: string;
  speakable?: boolean;
  featuredProductIds?: string[];
}

export interface PillarFaqEntry {
  question: string;
  answer: string;
}

export interface PillarSeoInput {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  internalNote?: string;
}

export interface Pillar {
  _id: string;
  slug: string;
  title: string;
  intro: string;
  heroImageUrl?: string;
  categoryTiles: PillarCategoryTile[];
  featuredProductIds: string[];
  sections: PillarSection[];
  faqs: PillarFaqEntry[];
  relatedPillarSlugs: string[];
  isActive: boolean;
  position: number;
  seo?: PillarSeoInput;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePillarInput {
  slug: string;
  title: string;
  intro: string;
  heroImageUrl?: string;
  categoryTiles?: PillarCategoryTile[];
  featuredProductIds?: string[];
  sections?: PillarSection[];
  faqs?: PillarFaqEntry[];
  relatedPillarSlugs?: string[];
  isActive?: boolean;
  position?: number;
  seo?: PillarSeoInput;
}

export type UpdatePillarInput = Partial<CreatePillarInput>;

export const usePillars = () => useQuery(GET_PILLARS, { fetchPolicy: "cache-and-network" });
export const useActivePillars = () => useQuery(GET_ACTIVE_PILLARS, { fetchPolicy: "cache-and-network" });
export const usePillar = (id: string) =>
  useQuery(GET_PILLAR, { variables: { id }, skip: !id, fetchPolicy: "cache-and-network" });
export const usePillarBySlug = (slug: string) =>
  useQuery(GET_PILLAR_BY_SLUG, { variables: { slug }, skip: !slug, fetchPolicy: "cache-and-network" });

export const useCreatePillar = () => {
  const [mutate, state] = useMutation(CREATE_PILLAR, {
    refetchQueries: [{ query: GET_PILLARS }],
  });
  return { create: (input: CreatePillarInput) => mutate({ variables: { input } }), ...state };
};

export const useUpdatePillar = () => {
  const [mutate, state] = useMutation(UPDATE_PILLAR, {
    refetchQueries: [{ query: GET_PILLARS }],
  });
  return {
    update: (id: string, input: UpdatePillarInput) => mutate({ variables: { id, input } }),
    ...state,
  };
};

export const useRemovePillar = () => {
  const [mutate, state] = useMutation(REMOVE_PILLAR, {
    refetchQueries: [{ query: GET_PILLARS }],
  });
  return { remove: (id: string) => mutate({ variables: { id } }), ...state };
};
