"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  submitContactMessage,
  SubmitContactInput,
} from "@/lib/queries/contact";

function ContactFormContent() {
  const [successMsg, setSuccessMsg] = useState("");
  const searchParams = useSearchParams();
  const prefillQueryType = searchParams.get("queryType");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<SubmitContactInput>({
    mode: "onChange",
  });

  useEffect(() => {
    if (prefillQueryType) {
      setValue("queryType", prefillQueryType, { shouldValidate: true });
    }
  }, [prefillQueryType, setValue]);

  const { mutate, isPending, error } = useMutation({
    mutationFn: submitContactMessage,
    onSuccess: (data) => {
      if (data.success) {
        setSuccessMsg(data.message);
        reset();
      } else {
        throw new Error(data.message);
      }
    },
  });

  const onSubmit = (data: SubmitContactInput) => {
    setSuccessMsg("");
    mutate(data);
  };

  const displayError = (error as Error)?.message;

  return (
    <>
      <Link
        href="/"
        className="inline-block mb-6 text-sm text-yellow-600 hover:underline"
      >
        ← Back to home
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-500 text-sm">
            Have a question, complaint, or feedback? Tell us about it and we'll
            get back to you.
          </p>
        </div>

        {/* Message states & Form */}
        {successMsg ? (
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-lg font-medium text-gray-900">{successMsg}</p>
            <button
              onClick={() => setSuccessMsg("")}
              className="mt-6 text-sm text-yellow-600 hover:underline"
            >
              Submit another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                placeholder="e.g. John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone", {
                  required: "Phone Number is required",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                placeholder="e.g. 9876543210"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Please enter a valid email",
                  },
                })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                placeholder="e.g. john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="queryType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Query Type
                </label>
                <select
                  id="queryType"
                  {...register("queryType", {
                    required: "Query Type is required",
                  })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                >
                  <option value="">Select a reason</option>
                  <option value="GENERAL">General Inquiry</option>
                  <option value="ORDER_ISSUE">Order Issue</option>
                  <option value="PRODUCT_INQUIRY">Product Inquiry</option>
                  <option value="COMPLAINT">Complaint</option>
                  <option value="FEEDBACK">Feedback</option>
                  <option value="RETURN_REQUEST">Return Request</option>
                </select>
                {errors.queryType && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.queryType.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="orderId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Order ID{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="orderId"
                  type="text"
                  {...register("orderId")}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                  placeholder="e.g. ORD-12345"
                />
                {errors.orderId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.orderId.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Message
              </label>
              <textarea
                id="message"
                rows={4}
                {...register("message", { required: "Message is required" })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors resize-none"
                placeholder="Tell us what happened..."
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.message.message}
                </p>
              )}
            </div>

            {displayError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{displayError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !isValid}
              style={{ backgroundColor: "#0c5273" }}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c5273] disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:brightness-90"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Message"
              )}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

export default function ContactUsPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Suspense
          fallback={
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
            </div>
          }
        >
          <ContactFormContent />
        </Suspense>
      </div>
    </main>
  );
}
