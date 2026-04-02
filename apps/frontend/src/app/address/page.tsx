import type { Metadata } from "next";
import Image from "next/image";

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
        batchCode: "G",
        companyName: "GAVYANMART PANCHGVYA UTPPAD PRIVATE LIMITED",
        address:
            "BHARI VAS, NEAR SWAMI VAS, VILLAGE SHERPURA,POST KANSARI DEESA, Banas Kantha, Banaskantha, Gujarat-385535",
        fssaiLicense: "XXXXXXXXXXXXXXX",
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
        <main className="w-full bg-white">
            <div className="bg-white px-[15px] md:px-[30px] lg:px-[45px] py-4 border-b">
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-black mb-3">
                    Manufacturing Unit Addresses
                </h1>
                <p className="text-[12px] lg:text-[16px] md:text-[16px] text-gray-600 leading-relaxed">
                    To identify manufacturing unit address, read the first character of
                    the batch number and see below:
                </p>
            </div>

            <div className="px-[15px] md:px-[30px] lg:px-[45px] py-6">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Batch Code
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Manufacturing Address
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {manufacturingUnits.map((unit, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="border border-gray-300 px-4 py-4 align-top">
                                        <span className="text-xl font-bold text-gray-900">
                                            {unit.batchCode}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {unit.companyName}
                                            </p>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {unit.address}
                                            </p>
                                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
                                                <Image
                                                    src="/fssai_logo-removebg-preview.png"
                                                    alt="FSSAI Logo"
                                                    width={60}
                                                    height={32}
                                                    className="h-8 w-auto"
                                                />
                                                <p className="text-sm font-medium text-gray-900">
                                                    License No:{" "}
                                                    <span className="font-normal">
                                                        {unit.fssaiLicense}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden space-y-4">
                    {manufacturingUnits.map((unit, index) => (
                        <div
                            key={index}
                            className="border border-gray-300 rounded-lg overflow-hidden shadow-sm"
                        >
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
                                <h2 className="text-[16px] font-bold text-gray-900">
                                    Batch Code: {unit.batchCode}
                                </h2>
                            </div>
                            <div className="px-4 py-4 space-y-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">
                                        {unit.companyName}
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {unit.address}
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-gray-200 flex items-center gap-2">
                                    <Image
                                        src="/fssai_logo-removebg-preview.png"
                                        alt="FSSAI Logo"
                                        width={48}
                                        height={24}
                                        className="h-6 w-auto"
                                    />
                                    <p className="text-sm font-medium text-gray-900">
                                        License No:{" "}
                                        <span className="font-normal text-gray-700">
                                            {unit.fssaiLicense}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
