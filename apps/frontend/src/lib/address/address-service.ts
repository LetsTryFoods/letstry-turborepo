import { graphqlClient } from '@/lib/graphql/client-factory';
import { GET_PLACE_DETAILS, CREATE_ADDRESS } from '@/lib/queries/address';

export class AddressService {
  static async getPlaceDetails(placeId: string, sessionToken?: string) {
    return graphqlClient.request(GET_PLACE_DETAILS, {
      placeId,
      sessionToken,
    });
  }

  static async createAddress(input: any) {
    return graphqlClient.request(CREATE_ADDRESS, { input });
  }
}
