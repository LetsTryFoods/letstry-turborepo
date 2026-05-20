import type { Metadata } from "next";
import { getPolicyByType } from "@/lib/policy";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const policy = await getPolicyByType("Privacy Policy");

  if (!policy) {
    return {
      title: "Privacy Policy | Letstry",
      description:
        "Read our privacy policy. Learn about how we handle and protect your personal information.",
    };
  }

  const seo = policy.seo;
  const defaultTitle = policy.title || "Privacy Policy";
  const defaultDescription =
    "Read our privacy policy. Learn about how we handle and protect your personal information.";

  return {
    title: seo?.metaTitle || defaultTitle,
    description: seo?.metaDescription || defaultDescription,
    keywords: seo?.metaKeywords || [],
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || defaultTitle,
      description:
        seo?.ogDescription || seo?.metaDescription || defaultDescription,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle || seo?.metaTitle || defaultTitle,
      description:
        seo?.ogDescription || seo?.metaDescription || defaultDescription,
      images: seo?.ogImage ? [seo.ogImage] : [],
    },
  };
}

export default async function PrivacyPolicyPage() {
  const policy = await getPolicyByType("Privacy Policy");

  if (policy?.content) {
    return (
      <div className="bg-white px-[15px] md:px-[30px] lg:px-[45px] py-4">
        <div className="text-[#000000] w-full">
          <div
            className="prose max-w-none text-[12px] lg:text-[16px] md:text-[16px]"
            dangerouslySetInnerHTML={{ __html: policy.content }}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-white px-[15px] md:px-[30px] lg:px-[45px] py-4 text-[#000000] w-full">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-black mb-6">
          Privacy Policy
        </h1>

        <section className="space-y-4 leading-snug text-justify lg:mb-8 md:mb-8">
          <p className="text-[12px] lg:text-[16px] md:text-[16px]">
            Earth Crust company ("Letstryfoods", "we", "us", or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our mobile application ("App") and website ("Services"). By accessing or using our Services, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section className="space-y-4 leading-snug text-justify lg:mb-8 md:mb-8">
          <h2 className="lg:text-xl md:text-xl text-[16px] font-bold mb-1">
            1. Information We Collect
          </h2>
          <p className="text-[12px] lg:text-[16px] md:text-[16px]">
            We collect the following types of information to provide and improve our Service to you:
          </p>
          <ul className="list-disc ml-5 text-[12px] lg:text-[16px] md:text-[16px] space-y-2">
            <li><strong>Personal Information:</strong> When you register an account or place an order, we may collect personally identifiable information such as your name, email address, phone number, shipping address, and billing information.</li>
            <li><strong>Usage Data:</strong> We may collect information about how the App is accessed and used. This Usage Data may include information such as your device's Internet Protocol (IP) address, device type, operating system version, unique device identifiers, and other diagnostic data.</li>
            <li><strong>Location Data:</strong> With your permission, we may collect and process information about your actual location to facilitate order delivery and provide location-based services. You can enable or disable location services at any time through your device settings.</li>
          </ul>
        </section>

        <section className="space-y-4 leading-snug text-justify lg:mb-8 md:mb-8">
          <h2 className="lg:text-xl md:text-xl text-[16px] font-bold mb-1">
            2. How We Use Your Information
          </h2>
          <p className="text-[12px] lg:text-[16px] md:text-[16px]">
            We use the collected data for various purposes, including:
          </p>
          <ul className="list-disc ml-5 text-[12px] lg:text-[16px] md:text-[16px] space-y-2">
            <li>To provide, maintain, and improve our Services.</li>
            <li>To process your orders, process payments, and facilitate order deliveries.</li>
            <li>To manage your account and provide customer support.</li>
            <li>To communicate with you regarding updates, promotions, and important account notifications.</li>
            <li>To monitor the usage of our App and detect, prevent, and address technical issues.</li>
          </ul>
        </section>

        <section className="space-y-4 leading-snug text-justify lg:mb-8 md:mb-8">
          <h2 className="lg:text-xl md:text-xl text-[16px] font-bold mb-1">
            3. Third-Party Services & Data Sharing
          </h2>
          <p className="text-[12px] lg:text-[16px] md:text-[16px]">
            We do not sell or rent your personal data to third parties. However, we may share your information with trusted third-party service providers who assist us in operating our App, conducting our business, or serving our users. These may include:
          </p>
          <ul className="list-disc ml-5 text-[12px] lg:text-[16px] md:text-[16px] space-y-2">
            <li><strong>Payment Processors:</strong> To process secure transactions.</li>
            <li><strong>Delivery Partners:</strong> To fulfill and ship your orders.</li>
            <li><strong>Analytics Providers:</strong> Tools such as Google Analytics or Firebase to analyze App usage and performance.</li>
          </ul>
          <p className="text-[12px] lg:text-[16px] md:text-[16px]">
            These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>
        </section>

        <section className="space-y-4 leading-snug text-justify lg:mb-8 md:mb-8">
          <h2 className="lg:text-xl md:text-xl text-[16px] font-bold mb-1">
            4. Security of Data
          </h2>
          <p className="text-[12px] lg:text-[16px] md:text-[16px]">
            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="space-y-4 leading-snug text-justify lg:mb-8 md:mb-8">
          <h2 className="lg:text-xl md:text-xl text-[16px] font-bold mb-1">
            5. Data Retention & Account Deletion
          </h2>
          <p className="text-[12px] lg:text-[16px] md:text-[16px]">
            We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy.
          </p>
          <p className="text-[12px] lg:text-[16px] md:text-[16px]">
            <strong>How to request data deletion:</strong> You have the right to request the deletion of your account and personal information at any time. To do so, please contact our support team at <strong>ecom@earthcrust.co.in</strong> or call us at <strong>+91-9654-932-262</strong>. Once your request is received, your account and all associated personal data will be permanently removed from our systems within 30 days.
          </p>
        </section>

        <section className="space-y-4 leading-snug text-justify lg:mb-8 md:mb-8">
          <h2 className="lg:text-xl md:text-xl text-[16px] font-bold mb-1">
            6. Changes to This Privacy Policy
          </h2>
          <p className="text-[12px] lg:text-[16px] md:text-[16px]">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="space-y-4 leading-snug text-justify lg:mb-8 md:mb-8">
          <h2 className="lg:text-xl md:text-xl text-[16px] font-bold mb-1">
            7. Contact Us
          </h2>
          <p className="text-[12px] lg:text-[16px] md:text-[16px]">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-disc ml-5 text-[12px] lg:text-[16px] md:text-[16px] space-y-2">
            <li><strong>Email:</strong> ecom@earthcrust.co.in</li>
            <li><strong>Phone:</strong> +91-9654-932-262</li>
          </ul>
        </section>
      </div>
    );
  }
}
