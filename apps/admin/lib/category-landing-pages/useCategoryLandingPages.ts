import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_CATEGORY_LANDING_PAGES,
  GET_CATEGORY_LANDING_PAGE,
  CREATE_CATEGORY_LANDING_PAGE,
  UPDATE_CATEGORY_LANDING_PAGE,
  UPDATE_CATEGORY_LANDING_PAGE_ACTIVE,
  DELETE_CATEGORY_LANDING_PAGE,
} from "@/lib/graphql/category-landing-pages";

export interface CategoryTile {
  name: string;
  blurb?: string;
  imageUrl?: string;
  shopNowUrl: string;
  position: number;
}

export interface CategoryFaq {
  question: string;
  answer: string;
  position: number;
}

export interface CategoryLandingPageSeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface CategoryLandingPage {
  _id: string;
  slug: string;
  pageTitle: string;
  description?: string;
  tilesHeading?: string;
  faqHeading?: string;
  tiles: CategoryTile[];
  faqs: CategoryFaq[];
  seo?: CategoryLandingPageSeo;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useCategoryLandingPages = () =>
  useQuery(GET_CATEGORY_LANDING_PAGES, { fetchPolicy: "cache-and-network" });

export const useCategoryLandingPage = (id: string) =>
  useQuery(GET_CATEGORY_LANDING_PAGE, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });

export const useCreateCategoryLandingPage = () => {
  const [mutate, { loading, error }] = useMutation(
    CREATE_CATEGORY_LANDING_PAGE,
    {
      refetchQueries: [{ query: GET_CATEGORY_LANDING_PAGES }],
    },
  );
  return { mutate, loading, error };
};

export const useUpdateCategoryLandingPage = () => {
  const [mutate, { loading, error }] = useMutation(
    UPDATE_CATEGORY_LANDING_PAGE,
    {
      refetchQueries: [{ query: GET_CATEGORY_LANDING_PAGES }],
    },
  );
  return { mutate, loading, error };
};

export const useUpdateCategoryLandingPageActive = () => {
  const [mutate, { loading, error }] = useMutation(
    UPDATE_CATEGORY_LANDING_PAGE_ACTIVE,
    {
      refetchQueries: [{ query: GET_CATEGORY_LANDING_PAGES }],
    },
  );
  return { mutate, loading, error };
};

export const useDeleteCategoryLandingPage = () => {
  const [mutate, { loading, error }] = useMutation(
    DELETE_CATEGORY_LANDING_PAGE,
    {
      refetchQueries: [{ query: GET_CATEGORY_LANDING_PAGES }],
    },
  );
  return { mutate, loading, error };
};
