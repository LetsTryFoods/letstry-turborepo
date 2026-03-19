import { graphqlClient } from '../../client/graphql.client.js';
import { SEARCH_PRODUCTS_QUERY } from './search-products.query.js';

interface SearchProductsInput {
    searchTerm: string;
    page: number;
    limit: number;
}

export async function searchProducts(input: SearchProductsInput): Promise<unknown> {
    const data = await graphqlClient.request(SEARCH_PRODUCTS_QUERY, input);
    return data;
}
