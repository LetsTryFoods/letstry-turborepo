import type { Metadata } from "next";
import Image from "next/image";
import BatchLookup from '@/components/address/BatchLookup';
import { ProductRangeBanner } from '@/components/address/ProductRangeBanner';

export const metadata: Metadata = {
    title: "Manufacturing Unit Addresses | Let's Try",
    description:
        "Find manufacturing unit addresses for Let's Try products. Identify the manufacturing unit by reading the first character of your batch number.",
    alternates: {
        canonical: "/address",
    },
    openGraph: {
        title: "Manufacturing Unit Addresses | Let's Try",
        description:
            "Find manufacturing unit addresses for Let's Try products. Identify the manufacturing unit by reading the first character of your batch number.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Manufacturing Unit Addresses | Let's Try",
        description:
            "Find manufacturing unit addresses for Let's Try products. Identify the manufacturing unit by reading the first character of your batch number.",
    },
};

const manufacturingUnits = [
    {
        batchCode: "K",
        companyName: "Earth Crust Private Limited",
        address:
            "118H, PHASE-V, SECTOR-56, HSIIDC, KUNDLI, DISTT. SONIPAT, HARYANA-131028",
        fssaiLicense: "10824999000091",
    },
    {
        batchCode: "R",
        companyName: "EARTH CRUST PRIVATE LIMITED",
        address:
            "PLOT NO. 2019, PHASE-2, SECTOR-38 RAI, TEHSIL RAI DIST, SONIPAT, HARYANA-131029",
        fssaiLicense: "10824999000091",
    },
    {
        batchCode: "T",
        companyName: "TIERRA FOOD INDIA PRIVATE LIMITED",
        address:
            "KINFRA FOOD PROCESSING PARK, ELAMANNOOR P.O, ADOOR, PATHANAMTHITTA, KERALA-681524",
        fssaiLicense: "10019041002004",
    },
];

export default function AddressPage() {
    return (
        <main className="w-full min-h-screen" style={{ background: "#fdfbf7" }}>
            <div className="bg-white px-[15px] md:px-[30px] lg:px-[45px] py-6 border-b">
                <h1
                    className="text-lg md:text-2xl lg:text-3xl font-bold mb-1"
                    style={{ color: "#0C5273" }}
                >
                    Manufacturing Unit Addresses
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                    Identify your manufacturing unit by reading the first character of
                    your batch number.
                </p>
            </div>

            <div className="px-[15px] md:px-[30px] lg:px-[45px] py-8">
                <div className="max-w-xl mx-auto">
                    <ProductRangeBanner />
                    <BatchLookup units={manufacturingUnits} />
                </div>
            </div>
        </main>
    );
}
