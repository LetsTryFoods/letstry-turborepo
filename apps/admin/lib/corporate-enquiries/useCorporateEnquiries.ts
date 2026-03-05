import { useQuery } from '@apollo/client/react';
import { GET_ALL_CORPORATE_ENQUIRIES } from '../graphql/corporate-enquiries';

export interface CorporateEnquiry {
    _id: string;
    companyName?: string;
    name: string;
    phone: string;
    email: string;
    purposeOfInquiry: string;
    otherPurpose?: string;
    createdAt: string;
}

interface GetAllCorporateEnquiriesResponse {
    getAllCorporateEnquiries: CorporateEnquiry[];
}

export const useCorporateEnquiries = () => {
    const { data, loading, error, refetch } = useQuery<GetAllCorporateEnquiriesResponse>(
        GET_ALL_CORPORATE_ENQUIRIES,
        { fetchPolicy: 'network-only' },
    );

    return {
        enquiries: data?.getAllCorporateEnquiries || [],
        loading,
        error,
        refetch,
    };
};
