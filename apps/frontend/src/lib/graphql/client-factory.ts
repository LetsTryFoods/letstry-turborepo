import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:5000/graphql';

const getClientAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; auth_token=`);
  
  if (parts.length === 2) {
    const token = parts.pop()?.split(';').shift();
    console.log('Client Auth Token Found:', !!token);
    return token || null;
  }
  
  console.log('Client Auth Token Not Found in cookies:', document.cookie);
  return null;
};

export const createClientGraphQLClient = (): GraphQLClient => {
  const token = getClientAuthToken();
  
  return new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
};

export const graphqlClient = {
  request: (document: any, variables?: any): Promise<any> => {
    const client = createClientGraphQLClient();
    return client.request(document, variables);
  }
};

export const getGraphQLEndpoint = (): string => GRAPHQL_ENDPOINT;
