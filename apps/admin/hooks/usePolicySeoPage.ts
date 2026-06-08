"use client";

import { useState, useMemo } from "react";
import {
  usePolicies,
  useUpdatePolicy,
  Policy,
} from "@/lib/policies/usePolicies";

interface PolicySeoStatus {
  policyId: string;
  hasSeo: boolean;
  metaTitle?: string;
  seoData?: any;
}

export function usePolicySeoPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "configured" | "not-configured"
  >("all");

  const {
    data: policiesData,
    loading: policiesLoading,
    error: policiesError,
    refetch: refetchPolicies,
  } = usePolicies();

  const { mutate: updatePolicy, loading: updateLoading } = useUpdatePolicy();

  // Extract policies from query result
  const policies: Policy[] = (policiesData as any)?.policies || [];

  const seoStatusMap = useMemo(() => {
    const map = new Map<string, PolicySeoStatus>();

    policies.forEach((policy: Policy) => {
      if (policy.seo && policy.seo.metaTitle) {
        map.set(policy._id, {
          policyId: policy._id,
          hasSeo: true,
          metaTitle: policy.seo.metaTitle,
          seoData: policy.seo,
        });
      }
    });

    return map;
  }, [policies]);

  const stats = useMemo(() => {
    const totalPolicies = policies.length;
    const configuredCount = policies.filter(
      (p: Policy) => p.seo && p.seo.metaTitle,
    ).length;
    const notConfiguredCount = totalPolicies - configuredCount;

    return {
      totalPolicies,
      configuredCount,
      notConfiguredCount,
      coveragePercentage:
        totalPolicies > 0
          ? Math.round((configuredCount / totalPolicies) * 100)
          : 0,
    };
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    if (!policies) return [];

    return policies.filter((policy: Policy) => {
      const matchesSearch =
        searchTerm === "" ||
        policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.type.toLowerCase().includes(searchTerm.toLowerCase());

      const hasSeo = !!(policy.seo && policy.seo.metaTitle);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "configured" && hasSeo) ||
        (filterStatus === "not-configured" && !hasSeo);

      return matchesSearch && matchesStatus;
    });
  }, [policies, searchTerm, filterStatus]);

  const handleEditSeo = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPolicy(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    refetchPolicies();
  };

  const updatePolicySeo = async (policyId: string, seoInput: any) => {
    return updatePolicy({
      variables: {
        id: policyId,
        input: { seo: seoInput },
      },
    });
  };

  return {
    policies: filteredPolicies,
    seoStatusMap,
    stats,
    isLoading: policiesLoading,
    updateLoading,
    error: policiesError,
    isFormOpen,
    selectedPolicy,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    handleEditSeo,
    handleCloseForm,
    handleFormSuccess,
    updatePolicySeo,
    refetchPolicies,
  };
}
