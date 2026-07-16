"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ImagePlus,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  submitContactMessage,
  SubmitContactInput,
} from "@/lib/queries/contact";
async function uploadImageToR2(file: File): Promise<string> {
  // Send raw file bytes to Next.js proxy — the server handles the Cloudflare R2 upload.
  // This avoids browser CORS errors when PUTting directly to R2 from letstryfoods.com.
  const params = new URLSearchParams({
    filename: file.name,
    contentType: file.type,
  });
  const res = await fetch(`/api/upload-image?${params}`, {
    method: "POST",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }
  const { url } = await res.json();
  return url;
}

function ContactFormContent() {
  const [successMsg, setSuccessMsg] = useState("");
  const [waNumber, setWaNumber] = useState<string | null>(null);
  const [productNames, setProductNames] = useState<string[]>([""]);
  const [images, setImages] = useState<{ file: File; preview: string; url?: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const prefillQueryType = searchParams.get("queryType");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<SubmitContactInput>({ mode: "onChange" });

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
        // Capture the number for the wa.me link (from the form field)
        const phone = (document.getElementById("phone") as HTMLInputElement)?.value;
        setWaNumber(phone || null);
        reset();
        setProductNames([""]);
        setImages([]);
      } else {
        throw new Error(data.message);
      }
    },
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);

    setUploadingImages(true);
    try {
      const uploaded = await Promise.all(
        newImages.map(async (img) => ({
          ...img,
          url: await uploadImageToR2(img.file),
        }))
      );
      setImages((prev) =>
        prev.map((existing) => {
          const match = uploaded.find((u) => u.preview === existing.preview);
          return match ? { ...existing, url: match.url } : existing;
        })
      );
    } catch {
      // individual failures are fine — url stays undefined and is filtered on submit
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = (data: SubmitContactInput) => {
    setSuccessMsg("");
    const filtered = productNames.filter((p) => p.trim() !== "");
    const uploadedUrls = images.map((i) => i.url).filter(Boolean) as string[];
    mutate({
      ...data,
      productNames: filtered.length > 0 ? filtered : undefined,
      imageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
    });
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
            Have a question, complaint, or feedback? Tell us about it and
            we&apos;ll get back to you.
          </p>
        </div>

        {/* Success state */}
        {successMsg ? (
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-lg font-medium text-gray-900">{successMsg}</p>
            <p className="text-sm text-gray-500">
              We&apos;ve also sent you a WhatsApp message to keep you updated.
            </p>

            {/* WhatsApp Chat CTA */}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER || '918840330283'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat with us on WhatsApp
            </a>

            <button
              onClick={() => { setSuccessMsg(""); setWaNumber(null); }}
              className="mt-2 text-sm text-yellow-600 hover:underline"
            >
              Submit another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
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
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Phone */}
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
                <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
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
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Query Type + Order ID */}
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
                  {...register("queryType", { required: "Query Type is required" })}
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
                  <p className="mt-1 text-xs text-red-500">{errors.queryType.message}</p>
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
              </div>
            </div>

            {/* Product names */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name(s){" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="space-y-2">
                {productNames.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const updated = [...productNames];
                        updated[index] = e.target.value;
                        setProductNames(updated);
                      }}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                      placeholder={`e.g. Product name ${index + 1}`}
                    />
                    {productNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setProductNames(productNames.filter((_, i) => i !== index))
                        }
                        className="shrink-0 h-11 w-11 flex items-center justify-center border border-gray-300 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setProductNames([...productNames, ""])}
                  className="flex items-center gap-1.5 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add another product
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attach Images{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.preview}
                        alt={`upload-${index}`}
                        className="h-20 w-20 object-cover rounded-xl border border-gray-200"
                      />
                      {!img.url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
                          <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
                className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-yellow-400 hover:text-yellow-600 transition-colors disabled:opacity-50"
              >
                {uploadingImages ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {uploadingImages ? "Uploading..." : "Add Photos"}
              </button>
            </div>

            {/* Message */}
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
                <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
              )}
            </div>

            {/* Error display */}
            {displayError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{displayError}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending || !isValid || uploadingImages}
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
