import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

// ── Mutation: save a new invoice ──────────────────────────────────────────────
export const CREATE_SAMPLE_INVOICE = gql`
  mutation CreateSampleInvoice($input: CreateSampleInvoiceInput!) {
    createSampleInvoice(input: $input) {
      _id
      invoiceNumber
      totalPcs
      totalMrpValue
      createdAt
    }
  }
`;

// ── Query: list all saved invoices ────────────────────────────────────────────
export const GET_SAMPLE_INVOICES = gql`
  query GetSampleInvoices {
    sampleInvoices {
      _id
      invoiceNumber
      recipient {
        name
        company
        address
        phone
        notes
      }
      items {
        sku
        skuName
        uom
        mrp
        quantity
      }
      totalPcs
      totalMrpValue
      createdAt
    }
  }
`;

// ── Query: fetch all product variants from product database ───────────────────
export const GET_SAMPLE_INVOICE_PRODUCTS = gql`
  query GetSampleInvoiceProducts {
    products(pagination: { page: 1, limit: 500 }, includeOutOfStock: true) {
      items {
        _id
        name
        variants {
          _id
          sku
          name
          price
          mrp
          weight
          weightUnit
        }
      }
    }
  }
`;

export function useCreateSampleInvoice() {
  return useMutation(CREATE_SAMPLE_INVOICE, {
    refetchQueries: [{ query: GET_SAMPLE_INVOICES }],
  });
}

export const UPDATE_SAMPLE_INVOICE = gql`
  mutation UpdateSampleInvoice($id: ID!, $input: CreateSampleInvoiceInput!) {
    updateSampleInvoice(id: $id, input: $input) {
      _id
      invoiceNumber
      totalPcs
      totalMrpValue
      createdAt
    }
  }
`;

export function useUpdateSampleInvoice() {
  return useMutation(UPDATE_SAMPLE_INVOICE, {
    refetchQueries: [{ query: GET_SAMPLE_INVOICES }],
  });
}

export function useSampleInvoices() {
  return useQuery(GET_SAMPLE_INVOICES);
}

export function useSampleInvoiceProducts() {
  return useQuery(GET_SAMPLE_INVOICE_PRODUCTS);
}

