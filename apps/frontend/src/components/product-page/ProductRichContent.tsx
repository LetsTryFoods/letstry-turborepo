/**
 * Sprint 4 rich content sections for the product detail page.
 *
 * Every section renders only if the CMS field is filled. This lets the
 * content team progressively backfill content per product without code
 * changes — empty fields hide gracefully.
 */

import Image from "next/image";
import { getCdnUrl } from "@/lib/image-utils";

interface RichContentProps {
  product: {
    longDescription?: string | null;
    healthBenefits?: string | null;
    servingSuggestions?: string | null;
    storageInstructions?: string | null;
    originStory?: string | null;
    manufacturingProcess?: string | null;
    audience?: string[] | null;
    occasions?: string[] | null;
    pros?: { text: string }[] | null;
    cons?: { text: string }[] | null;
    certifications?:
      | { name: string; number?: string | null; iconUrl?: string | null }[]
      | null;
    lifestyleImages?:
      | { url: string; alt: string; caption?: string | null }[]
      | null;
    videoUrl?: string | null;
    videoTitle?: string | null;
    videoDescription?: string | null;
    nutrition?: {
      servingSize?: string | null;
      servingsPerPack?: string | null;
      calories?: string | null;
      caloriesPerServing?: string | null;
      proteinContent?: string | null;
      fatContent?: string | null;
      carbohydrateContent?: string | null;
      fiberContent?: string | null;
      sugarContent?: string | null;
      sodiumContent?: string | null;
      ironContent?: string | null;
      calciumContent?: string | null;
    } | null;
    fssaiLicense?: string | null;
  };
}

export function ProductRichContent({ product }: RichContentProps) {
  return (
    <div className="space-y-10 max-w-4xl">
      <ProductLongDescription html={product.longDescription} />
      <ProductHealthBenefits html={product.healthBenefits} />
      <ProductLifestyleGallery images={product.lifestyleImages} />
      <ProductServingSuggestions html={product.servingSuggestions} />
      <ProductNutritionTable nutrition={product.nutrition} />
      <ProductOriginStory html={product.originStory} />
      <ProductManufacturingProcess html={product.manufacturingProcess} />
      <ProductWhoFor
        audience={product.audience}
        occasions={product.occasions}
      />
      <ProductProsCons pros={product.pros} cons={product.cons} />
      <ProductVideo
        url={product.videoUrl}
        title={product.videoTitle}
        description={product.videoDescription}
      />
      <ProductStorage instructions={product.storageInstructions} />
      <ProductCertifications certifications={product.certifications} />
      <ProductFssai license={product.fssaiLicense} />
    </div>
  );
}

// --------------------------------------------------------------------------
// Individual section components — each null-checks before rendering.
// --------------------------------------------------------------------------

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4"
    >
      {children}
    </h2>
  );
}

function ProductLongDescription({ html }: { html?: string | null }) {
  if (!html) return null;
  return (
    <section aria-labelledby="about-heading">
      <SectionHeading id="about-heading">About this product</SectionHeading>
      <div
        data-speakable="true"
        className="prose prose-base max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

function ProductHealthBenefits({ html }: { html?: string | null }) {
  if (!html) return null;
  return (
    <section
      aria-labelledby="benefits-heading"
      className="bg-green-50 rounded-2xl p-6 sm:p-8 border border-green-100"
    >
      <SectionHeading id="benefits-heading">Health benefits</SectionHeading>
      <div
        className="prose prose-base max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

function ProductServingSuggestions({ html }: { html?: string | null }) {
  if (!html) return null;
  return (
    <section aria-labelledby="serving-heading">
      <SectionHeading id="serving-heading">How to enjoy</SectionHeading>
      <div
        className="prose prose-base max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

function ProductOriginStory({ html }: { html?: string | null }) {
  if (!html) return null;
  return (
    <section aria-labelledby="origin-heading">
      <SectionHeading id="origin-heading">The story behind it</SectionHeading>
      <div
        className="prose prose-base max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

function ProductManufacturingProcess({ html }: { html?: string | null }) {
  if (!html) return null;
  return (
    <section aria-labelledby="process-heading">
      <SectionHeading id="process-heading">How we make it</SectionHeading>
      <div
        className="prose prose-base max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

function ProductWhoFor({
  audience,
  occasions,
}: {
  audience?: string[] | null;
  occasions?: string[] | null;
}) {
  const hasAudience = audience && audience.length > 0;
  const hasOccasions = occasions && occasions.length > 0;
  if (!hasAudience && !hasOccasions) return null;
  return (
    <section aria-labelledby="who-for-heading">
      <SectionHeading id="who-for-heading">Who this is for</SectionHeading>
      <div className="grid sm:grid-cols-2 gap-4">
        {hasAudience && (
          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">
              Best for
            </h3>
            <ul className="flex flex-wrap gap-2">
              {audience!.map((a) => (
                <li
                  key={a}
                  className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-sm border border-amber-200"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasOccasions && (
          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">
              Great for
            </h3>
            <ul className="flex flex-wrap gap-2">
              {occasions!.map((o) => (
                <li
                  key={o}
                  className="px-3 py-1 rounded-full bg-rose-50 text-rose-900 text-sm border border-rose-200"
                >
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductProsCons({
  pros,
  cons,
}: {
  pros?: { text: string }[] | null;
  cons?: { text: string }[] | null;
}) {
  const hasPros = pros && pros.length > 0;
  const hasCons = cons && cons.length > 0;
  if (!hasPros && !hasCons) return null;
  return (
    <section aria-labelledby="pros-cons-heading">
      <SectionHeading id="pros-cons-heading">At a glance</SectionHeading>
      <div className="grid sm:grid-cols-2 gap-6">
        {hasPros && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <h3 className="text-sm font-semibold text-emerald-900 mb-3">
              What we love
            </h3>
            <ul className="space-y-2">
              {pros!.map((p, i) => (
                <li key={i} className="text-emerald-900 text-sm flex gap-2">
                  <span aria-hidden>✓</span>
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasCons && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-sm font-semibold text-amber-900 mb-3">
              Things to know
            </h3>
            <ul className="space-y-2">
              {cons!.map((c, i) => (
                <li key={i} className="text-amber-900 text-sm flex gap-2">
                  <span aria-hidden>!</span>
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductLifestyleGallery({
  images,
}: {
  images?: { url: string; alt: string; caption?: string | null }[] | null;
}) {
  if (!images || images.length === 0) return null;
  return (
    <section aria-labelledby="lifestyle-heading">
      <SectionHeading id="lifestyle-heading">In your kitchen</SectionHeading>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <figure key={i} className="rounded-xl overflow-hidden bg-gray-100">
            <div className="relative aspect-square">
              <Image
                src={getCdnUrl(img.url)}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            {img.caption && (
              <figcaption className="p-2 text-xs text-gray-600">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

function ProductVideo({
  url,
  title,
  description,
}: {
  url?: string | null;
  title?: string | null;
  description?: string | null;
}) {
  if (!url) return null;
  // Naive YouTube embed — extracts the video ID. Other providers fall back
  // to a plain link.
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
  );
  return (
    <section aria-labelledby="video-heading">
      <SectionHeading id="video-heading">
        {title || "See it in action"}
      </SectionHeading>
      {ytMatch ? (
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            title={title || "Product video"}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0C5273] underline"
        >
          Watch the video →
        </a>
      )}
      {description && (
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      )}
    </section>
  );
}

function ProductStorage({ instructions }: { instructions?: string | null }) {
  if (!instructions) return null;
  return (
    <section aria-labelledby="storage-heading">
      <SectionHeading id="storage-heading">Storage instructions</SectionHeading>
      <p className="text-gray-700">{instructions}</p>
    </section>
  );
}

function ProductCertifications({
  certifications,
}: {
  certifications?:
    | { name: string; number?: string | null; iconUrl?: string | null }[]
    | null;
}) {
  if (!certifications || certifications.length === 0) return null;
  return (
    <section aria-labelledby="certs-heading">
      <SectionHeading id="certs-heading">
        Certifications & standards
      </SectionHeading>
      <ul className="flex flex-wrap gap-3">
        {certifications.map((c, i) => (
          <li
            key={i}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white"
          >
            {c.iconUrl && (
              <Image
                src={getCdnUrl(c.iconUrl)}
                alt=""
                width={28}
                height={28}
                className="object-contain"
              />
            )}
            <span className="text-sm">
              <strong className="text-gray-900">{c.name}</strong>
              {c.number ? (
                <span className="text-gray-500"> · {c.number}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductFssai({ license }: { license?: string | null }) {
  if (!license) return null;
  return (
    <section className="text-sm text-gray-500 border-t border-gray-100 pt-4">
      FSSAI licence:{" "}
      <span className="font-medium text-gray-700">{license}</span>
    </section>
  );
}

function ProductNutritionTable({
  nutrition,
}: {
  nutrition?: RichContentProps["product"]["nutrition"];
}) {
  if (!nutrition) return null;
  const rows: { label: string; value: string | null | undefined }[] = [
    { label: "Serving size", value: nutrition.servingSize },
    { label: "Servings per pack", value: nutrition.servingsPerPack },
    { label: "Energy (per 100g)", value: nutrition.calories },
    { label: "Energy (per serving)", value: nutrition.caloriesPerServing },
    { label: "Protein", value: nutrition.proteinContent },
    { label: "Total fat", value: nutrition.fatContent },
    { label: "Carbohydrate", value: nutrition.carbohydrateContent },
    { label: "of which sugars", value: nutrition.sugarContent },
    { label: "Dietary fibre", value: nutrition.fiberContent },
    { label: "Sodium", value: nutrition.sodiumContent },
    { label: "Iron", value: nutrition.ironContent },
    { label: "Calcium", value: nutrition.calciumContent },
  ].filter((r) => r.value);

  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="nutrition-heading">
      <SectionHeading id="nutrition-heading">
        Nutrition information
      </SectionHeading>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.label}
                className="border-b border-gray-100 last:border-b-0"
              >
                <th
                  scope="row"
                  className="text-left p-3 bg-gray-50 font-medium text-gray-700 w-1/2"
                >
                  {r.label}
                </th>
                <td className="p-3 text-gray-900">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Values are typical and may vary slightly batch to batch. Always refer to
        the pack for the authoritative label.
      </p>
    </section>
  );
}
