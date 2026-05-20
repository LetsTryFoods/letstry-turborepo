import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

export const GET_SKU_MASTERS = gql`
  query GetSkuMasters {
    skuMasters {
      _id
      masterSku
      skuName
      vendorName
      vendorContactDetails
      jobStructure
      uom
      caseSize
      mrp
      npiLinksRaw
      npiLinksUpdated
      printFilesRaw
      printFilesUpdated
      createdAt
      updatedAt
    }
  }
`;

export const GET_SKU_MASTER_BY_ID = gql`
  query GetSkuMasterById($id: ID!) {
    skuMasterById(id: $id) {
      _id
      masterSku
      skuName
      vendorName
      vendorContactDetails
      jobStructure
      uom
      caseSize
      mrp
      npiLinksRaw
      npiLinksUpdated
      printFilesRaw
      printFilesUpdated
      createdAt
      updatedAt
    }
  }
`;

export interface SkuMasterRecord {
  _id: string;
  masterSku: number;
  skuName: string;
  vendorName?: string;
  vendorContactDetails?: string;
  jobStructure?: string;
  uom?: string;
  caseSize?: number;
  mrp?: number;
  npiLinksRaw?: string;
  npiLinksUpdated?: string;
  printFilesRaw?: string;
  printFilesUpdated?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetSkuMastersData {
  skuMasters: SkuMasterRecord[];
}

export function useSkuMasters() {
  return useQuery<GetSkuMastersData>(GET_SKU_MASTERS);
}

export function useSkuMasterById(id: string) {
  return useQuery(GET_SKU_MASTER_BY_ID, { variables: { id }, skip: !id });
}
