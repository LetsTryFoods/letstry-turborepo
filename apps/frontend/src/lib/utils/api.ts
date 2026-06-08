/**
 * Returns the backend base URL for REST API calls.
 * If NEXT_PUBLIC_GRAPHQL_URL is set, it extracts the origin (e.g. https://apiv3.letstryfoods.com)
 * by removing the "/graphql" suffix.
 * Otherwise, it falls back to NEXT_PUBLIC_API_URL or localhost.
 */
export function getBackendApiUrl(): string {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (graphqlUrl) {
    return graphqlUrl.replace(/\/graphql\/?$/, "");
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}
