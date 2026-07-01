"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Phone, Mail, MapPin } from "lucide-react";
import {
  submitDistributorEnquiry,
  type DistributorEnquiryInput,
} from "@/lib/queries/distributor-enquiry";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition";

const NAVY = "#001F3F";
const NAVY_DARK = "#002d5a";

const initialForm: DistributorEnquiryInput = {
  name: "",
  address: "",
  phone: "",
  email: "",
  gstNo: "",
  fssaiNo: "",
  location: "",
  totalVehicles: "",
  manpower: "",
  godownSpaceSqft: "",
  annualTurnover: "",
  currentCompany: "",
};

const FIELDS: Array<{
  key: keyof DistributorEnquiryInput;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}> = [
  { key: "name", label: "Name", required: true, placeholder: "Full name" },
  {
    key: "address",
    label: "Address",
    required: true,
    placeholder: "Your business address",
  },
  {
    key: "phone",
    label: "Phone Number",
    required: true,
    type: "tel",
    placeholder: "10-digit mobile number",
  },
  {
    key: "email",
    label: "Email Id",
    required: true,
    type: "email",
    placeholder: "your@email.com",
  },
  { key: "gstNo", label: "GST No", required: true, placeholder: "GST number" },
  {
    key: "fssaiNo",
    label: "FSSAI No",
    required: true,
    placeholder: "FSSAI license number",
  },
  {
    key: "location",
    label: "Location / Area of Operation",
    required: true,
    placeholder: "City / region you operate in",
  },
  {
    key: "totalVehicles",
    label: "Total Vehicles You Have",
    required: true,
    placeholder: "e.g. 4",
  },
  {
    key: "manpower",
    label: "Manpower",
    required: true,
    placeholder: "Number of staff",
  },
  {
    key: "godownSpaceSqft",
    label: "Godown Space in Sqft",
    required: true,
    placeholder: "e.g. 2000",
  },
  {
    key: "annualTurnover",
    label: "Annual Turnover",
    required: true,
    placeholder: "e.g. 50,00,000",
  },
  {
    key: "currentCompany",
    label: "Presently Dealing With Which Company",
    required: true,
    placeholder: "Companies you currently distribute for",
  },
];

export default function DistributionFormPage() {
  const [form, setForm] = useState<DistributorEnquiryInput>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => submitDistributorEnquiry(form),
    onSuccess: () => {
      setSubmitted(true);
      setForm(initialForm);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  return (
    <main className="min-h-screen bg-white">
      <section
        className="relative overflow-hidden px-6 py-20 text-white"
        style={{
          background:
            "linear-gradient(135deg, #001F3F 0%, #003366 50%, #00509E 100%)",
        }}
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-200">
            Become a Distributor
          </p>
          <h1 className="text-4xl font-extrabold leading-tight">
            Partner With Us,
            <br />
            <span className="text-yellow-300">Grow Together.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-blue-100">
            Join the Let&apos;s Try Foods distribution network and bring clean,
            healthy snacks to your region.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 md:px-12 lg:px-0">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
              <p className="mt-1 text-sm text-gray-500">
                Reach out to us directly or submit the distributor form below.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#001F3F1A", color: NAVY }}
                >
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Call Us
                  </p>
                  <a
                    href="tel:+919654932262"
                    className="block text-sm font-medium text-gray-800"
                  >
                    +91-9650-791-226
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#001F3F1A", color: NAVY }}
                >
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Email Us
                  </p>
                  <a
                    href="mailto:corporate@letstryfoods.com"
                    className="text-sm font-medium text-gray-800"
                  >
                    amar@letstryfoods.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#001F3F1A", color: NAVY }}
                >
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Visit Us
                  </p>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    2nd Floor, Sewa Tower, Phase IV,
                    <br />
                    Maruti Udyog, Sector 18, Gurugram,
                    <br />
                    Shahpur, Haryana 122015
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-100">
            <h2 className="mb-1 text-xl font-bold text-gray-900">
              Distributor Enquiry
            </h2>
            <p className="mb-6 text-xs text-gray-400">
              Let&apos;s Try Foods — your one-stop solution for healthy snacking
            </p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Enquiry Submitted!
                </h3>
                <p className="text-sm text-gray-500">
                  Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-sm font-medium hover:underline"
                  style={{ color: NAVY }}
                >
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      required={field.required}
                      type={field.type || "text"}
                      className={inputClass}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [field.key]: e.target.value }))
                      }
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-60"
                  style={{ backgroundColor: isPending ? NAVY_DARK : NAVY }}
                >
                  {isPending ? "Submitting..." : "Submit Enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
