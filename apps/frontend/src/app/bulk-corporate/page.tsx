"use client";

import { useState, } from "react";
import { useMutation } from "@tanstack/react-query";
import { Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { submitCorporateEnquiry } from "@/lib/queries/corporate-enquiry";

const PURPOSE_OPTIONS = [
    { value: "FestiveGifting", label: "Festive Gifting" },
    { value: "WholesaleRetail", label: "Wholesale / Retail" },
    // { value: "WeddingGifting", label: "Wedding Gifting" },
    { value: "CorporateGifting", label: "Corporate Gifting" },
    { value: "PantrySnacking", label: "Pantry Snacking" },
    { value: "PersonalGifting", label: "Personal Gifting" },
    { value: "EmployeeGifting", label: "Employee Gifting" },
    { value: "Others", label: "Others" },
];

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition";

const NAVY = "#001F3F";
const NAVY_DARK = "#002d5a";

export default function BulkCorporatePage() {
    const [form, setForm] = useState({
        companyName: "",
        name: "",
        phone: "",
        email: "",
        purposeOfInquiry: "",
        otherPurpose: "",
    });

    const [submitted, setSubmitted] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            submitCorporateEnquiry({
                companyName: form.companyName || undefined,
                name: form.name,
                phone: form.phone,
                email: form.email,
                purposeOfInquiry: form.purposeOfInquiry,
                otherPurpose:
                    form.purposeOfInquiry === "Others" ? form.otherPurpose : undefined,
            }),
        onSuccess: () => {
            setSubmitted(true);
            setForm({
                companyName: "",
                name: "",
                phone: "",
                email: "",
                purposeOfInquiry: "",
                otherPurpose: "",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate();
    };

    return (
        <main className="min-h-screen bg-white">
            <section
                className="relative overflow-hidden md:hidden px-6 py-20 text-white"
                style={{ background: "linear-gradient(135deg, #001F3F 0%, #003366 50%, #00509E 100%)" }}
            >
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="relative mx-auto max-w-4xl text-center">
                    <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-200">
                        Bulk &amp; Corporate
                    </p>
                    <h1 className="text-4xl font-extrabold leading-tight">
                        Healthy Snacking,
                        <br />
                        <span className="text-yellow-300">At Scale.</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-xl text-base text-blue-100">
                        Partner with Let&apos;s Try Foods for bulk gifting, corporate pantry
                        setups, and wholesale requirements. We bring clean, healthy snacks
                        to your team.
                    </p>
                </div>
            </section>

            <section className="relative hidden md:block w-full">
                <Image 
                    src="https://d11a0m43ek7ap8.cloudfront.net/BULK+%26+CORPORATE.png" 
                    alt="Bulk & Corporate" 
                    width={1920} 
                    height={400} 
                    className="w-full h-auto object-cover"
                    priority
                />
            </section>

            <section className="mx-auto max-w-5xl px-6 py-16 md:px-12 lg:px-0">
                <div className="grid gap-10 lg:grid-cols-2">
                    <div className="flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Get in Touch
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Reach out to us directly or submit an enquiry below.
                            </p>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "#001F3F1A", color: NAVY }}>
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
                                        +91-9654-932-262
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "#001F3F1A", color: NAVY }}>
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Email U
                                    </p>
                                    <a
                                        href="mailto:corporate@letstryfoods.com"
                                        className="text-sm font-medium text-gray-800"
                                    >
                                        corporate@letstryfoods.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "#001F3F1A", color: NAVY }}>
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
                            Business Enquiry
                        </h2>
                        <p className="mb-6 text-xs text-gray-400">
                            Let&apos;s Try Foods — your one-stop solution for healthy snacking
                        </p>

                        {submitted ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Company Name
                                    </label>
                                    <input
                                        className={inputClass}
                                        placeholder="Your company name"
                                        value={form.companyName}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, companyName: e.target.value }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Your Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        className={inputClass}
                                        placeholder="Full name"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, name: e.target.value }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        className={inputClass}
                                        placeholder="10-digit mobile number"
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, phone: e.target.value }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        className={inputClass}
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, email: e.target.value }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-gray-600">
                                        Purpose of Inquiry <span className="text-red-500">*</span>
                                    </label>
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col gap-2">
                                        {PURPOSE_OPTIONS.map((opt) => (
                                            <label
                                                key={opt.value}
                                                className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
                                            >
                                                <input
                                                    type="radio"
                                                    name="purposeOfInquiry"
                                                    value={opt.value}
                                                    required
                                                    checked={form.purposeOfInquiry === opt.value}
                                                    onChange={() =>
                                                        setForm((f) => ({
                                                            ...f,
                                                            purposeOfInquiry: opt.value,
                                                            otherPurpose: "",
                                                        }))
                                                    }
                                                    className=""
                                                />
                                                {opt.label}
                                                {opt.value === "Others" &&
                                                    form.purposeOfInquiry === "Others" && (
                                                        <input
                                                            className="ml-2 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none"
                                                            placeholder="Please specify"
                                                            value={form.otherPurpose}
                                                            onChange={(e) =>
                                                                setForm((f) => ({
                                                                    ...f,
                                                                    otherPurpose: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                    )}
                                            </label>
                                        ))}
                                    </div>
                                </div>

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
