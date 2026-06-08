import { createServerGraphQLClient } from "@/lib/graphql/server-client-factory";
import { GET_ACTIVE_PRESS_MENTIONS } from "@/lib/queries/press-mentions";

export interface PressMention {
  _id: string;
  slug: string;
  publication: string;
  publicationLogoUrl?: string | null;
  headline: string;
  url: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt: string;
  category?: string | null;
  isActive: boolean;
  position: number;
}

export async function getActivePressMentions(): Promise<PressMention[]> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<{ activePressMentions: PressMention[] }>(
      GET_ACTIVE_PRESS_MENTIONS,
    );
    return data?.activePressMentions ?? [];
  } catch (e) {
    console.error("getActivePressMentions failed", e);
    return [];
  }
}
