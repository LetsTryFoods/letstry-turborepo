import { GraphQLClient } from "graphql-request";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql";

export const createClientGraphQLClient = (): GraphQLClient => {
  return new GraphQLClient(GRAPHQL_ENDPOINT, {
    credentials: "include",
  });
};

export const graphqlClient = {
  request: (document: any, variables?: any): Promise<any> => {
    const client = createClientGraphQLClient();
    return client.request(document, variables);
  },
};

export const getGraphQLEndpoint = (): string => GRAPHQL_ENDPOINT;
