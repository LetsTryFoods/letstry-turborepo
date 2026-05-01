/**
 * Trust badge row that lives directly above the add-to-cart button.
 *
 * Three universal badges (no palm oil, vegetarian, made in India) plus
 * conditional badges driven by product flags / occasions. This is one of
 * the highest-impact conversion / engagement upgrades on the PDP and
 * doubles as a visible expression of the brand-claim matrix.
 */

interface TrustRowProps {
  isVegetarian?: boolean | null;
  isGlutenFree?: boolean | null;
  primaryCategorySlug?: string | null;
  occasions?: string[] | null;
}

const MAIDA_CONTAINING = new Set(['rusk', 'purani-delhi']);
const NO_REFINED_SUGAR_SLUGS = new Set(['cookies']);

export function ProductTrustRow({
  isVegetarian,
  isGlutenFree,
  primaryCategorySlug,
  occasions,
}: TrustRowProps) {
  const slug = (primaryCategorySlug || '').toLowerCase();
  const canClaimNoMaida = !MAIDA_CONTAINING.has(slug);
  const canClaimNoSugar = NO_REFINED_SUGAR_SLUGS.has(slug);
  const isVrat = (occasions || []).some((o) => /vrat|navratri|fasting/i.test(o)) || slug === 'fasting-special';

  const badges: { label: string; tone: string }[] = [];
  badges.push({ label: 'No palm oil', tone: 'emerald' });
  if (canClaimNoMaida) badges.push({ label: 'No maida', tone: 'amber' });
  if (canClaimNoSugar) badges.push({ label: 'No refined sugar', tone: 'rose' });
  if (isVegetarian !== false) badges.push({ label: '100% vegetarian', tone: 'green' });
  if (isGlutenFree) badges.push({ label: 'Gluten-free', tone: 'sky' });
  if (isVrat) badges.push({ label: 'Vrat-friendly', tone: 'indigo' });
  badges.push({ label: 'Made in India', tone: 'orange' });

  const toneClass: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    rose: 'bg-rose-50 text-rose-900 border-rose-200',
    green: 'bg-green-50 text-green-900 border-green-200',
    sky: 'bg-sky-50 text-sky-900 border-sky-200',
    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    orange: 'bg-orange-50 text-orange-900 border-orange-200',
  };

  return (
    <div
      className="flex flex-wrap gap-2 my-4"
      role="list"
      aria-label="Product highlights"
    >
      {badges.map((b) => (
        <span
          key={b.label}
          role="listitem"
          className={`text-xs sm:text-sm font-medium px-3 py-1 rounded-full border ${toneClass[b.tone]}`}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
