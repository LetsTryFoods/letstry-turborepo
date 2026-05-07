'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { usePillars, useCreatePillar, useUpdatePillar, useRemovePillar, type Pillar } from '@/lib/pillars/usePillars';
import { useCategories, type Category } from '@/lib/categories/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Sprint 4 — minimal-viable Pillar CRUD admin page.
 *
 * The Pillar collection drives the /p/<slug> CMS-driven landing-page
 * template. Each pillar captures a non-branded keyword cluster (e.g.
 * "no palm oil snacks", "no maida snacks"). Creating a pillar here
 * publishes a live page on the storefront — no code change needed.
 *
 * This is intentionally a basic form to let the content team start
 * populating pillars immediately. Section-array editing (rich-text
 * sections, FAQs, category tiles) currently uses JSON textareas;
 * a richer drag-and-drop editor ships in a follow-up.
 */
export default function PillarsAdminPage() {
  const { data, loading, refetch } = usePillars();
  const { create } = useCreatePillar();
  const { update } = useUpdatePillar();
  const { remove } = useRemovePillar();
  // Pulled here so the form can validate customRoute against existing
  // category slugs before sending the mutation.
  const { data: categoriesData } = useCategories({ page: 1, limit: 200 }, true);
  const categorySlugs: string[] = (
    (categoriesData as { categories?: { items?: Category[] } } | undefined)
      ?.categories?.items || []
  ).map((c) => c.slug);

  const pillars: Pillar[] = (data as { pillars?: Pillar[] } | undefined)?.pillars || [];
  const [editing, setEditing] = useState<Pillar | null>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pillar pages</h1>
          <p className="text-sm text-gray-500">
            CMS-driven landing pages for non-branded keyword clusters. Publishes to <code>/p/&lt;slug&gt;</code>.
          </p>
        </div>
        <Button onClick={() => setEditing(emptyPillar())}>+ New pillar</Button>
      </header>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="grid gap-3">
        {pillars.map((p) => (
          <Card key={p._id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {p.title}{' '}
                <span className="text-xs text-gray-500">
                  {p.customRoute || `/p/${p.slug}`} · {p.isActive ? 'active' : 'draft'}
                </span>
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(p)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (confirm(`Delete pillar "${p.title}"?`)) {
                      await remove(p._id);
                      refetch();
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 line-clamp-2">{p.intro}</p>
            </CardContent>
          </Card>
        ))}
        {!loading && pillars.length === 0 && (
          <p className="text-sm text-gray-500">
            No pillars yet. Click &ldquo;New pillar&rdquo; to create the first one — start with{' '}
            <strong>palm-oil-free-namkeen</strong>.
          </p>
        )}
      </div>

      {editing && (
        <PillarForm
          pillar={editing}
          categorySlugs={categorySlugs}
          onCancel={() => setEditing(null)}
          onSave={async (input) => {
            // Strip server-managed fields. The form state IS the full Pillar
            // (including _id / createdAt / updatedAt) but Create/UpdatePillarInput
            // don't accept those — sending them produces a GraphQL "field not
            // defined on input" error and the save fails silently for the
            // content team.
            const payload = stripServerFields(input as Pillar);

            // Slug-collision guard: if customRoute matches an existing category
            // (e.g. customRoute='/bhujia' would shadow the /bhujia category),
            // refuse to save. The storefront [slug] route resolves pillars
            // before categories, so saving this would silently break the
            // category page.
            if (payload.customRoute) {
              // Strip leading slash for comparison
              const routeSlug = payload.customRoute.replace(/^\//, '').toLowerCase();
              if (categorySlugs.includes(routeSlug)) {
                toast.error(
                  `Custom URL ${payload.customRoute} conflicts with the existing /${routeSlug} category. Pick a different URL or leave the field blank to use /p/${payload.slug}.`,
                );
                return;
              }
            }

            try {
              if (editing._id) {
                await update(editing._id, payload);
                toast.success(`Pillar "${payload.title}" updated`);
              } else {
                await create(payload as Parameters<typeof create>[0]);
                toast.success(`Pillar "${payload.title}" created`);
              }
              setEditing(null);
              refetch();
            } catch (err) {
              toast.error(`Save failed: ${(err as Error).message}`);
            }
          }}
        />
      )}
    </div>
  );
}

function stripServerFields(p: Pillar) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, createdAt, updatedAt, ...rest } = p;
  return rest;
}

function emptyPillar(): Pillar {
  return {
    _id: '',
    slug: '',
    customRoute: '',
    title: '',
    intro: '',
    heroImageUrl: '',
    categoryTiles: [],
    featuredProductIds: [],
    sections: [],
    faqs: [],
    relatedPillarSlugs: [],
    // Default to true: every other CMS form (authors, press-mentions, banners,
    // landing pages, etc.) defaults isActive to true. Defaulting false here
    // led to silent-unpublish bugs — content team would create a pillar,
    // forget to tick the checkbox, and the page would 404 on the storefront
    // because activePillars / customRoute lookups filter on isActive=true.
    isActive: true,
    position: 0,
    createdAt: '',
    updatedAt: '',
  };
}

function PillarForm({
  pillar,
  categorySlugs,
  onSave,
  onCancel,
}: {
  pillar: Pillar;
  categorySlugs: string[];
  onSave: (input: Partial<Pillar>) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Pillar>(pillar);

  // Live conflict check for the customRoute field — gives the content team
  // an inline warning while typing, not just at save time.
  const customRouteSlug = (form.customRoute || '').replace(/^\//, '').toLowerCase();
  const customRouteConflict =
    customRouteSlug && categorySlugs.includes(customRouteSlug);

  // Helper to suggest a clean URL based on slug.
  const suggestedCleanUrl = form.slug ? `/${form.slug}` : '';

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader>
        <CardTitle>{pillar._id ? 'Edit pillar' : 'New pillar'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Slug" hint="lowercase-with-dashes, e.g. palm-oil-free-namkeen. Drives the default /p/<slug> route.">
          <Input
            value={form.slug}
            onChange={(e) => {
              const newSlug = e.target.value;
              // If customRoute was previously the auto-suggestion of the old
              // slug, keep it tracking the new slug. If the user typed a
              // custom value, leave it alone.
              const wasAutoFilled =
                form.customRoute === `/${form.slug}` || form.customRoute === '';
              setForm({
                ...form,
                slug: newSlug,
                customRoute: wasAutoFilled && newSlug ? `/${newSlug}` : form.customRoute,
              });
            }}
          />
        </Field>
        <Field
          label="Custom URL (clean URL)"
          hint={
            customRouteConflict
              ? `⚠️ Conflicts with existing /${customRouteSlug} category. Save will be blocked. Either rename the slug, or clear this field to fall back to /p/${form.slug}.`
              : `Defaults to /<slug> for clean URLs (better SEO). Leave blank to publish at /p/${form.slug || '<slug>'} instead. Suggested: ${suggestedCleanUrl}`
          }
        >
          <Input
            value={form.customRoute || ''}
            placeholder={suggestedCleanUrl ? `e.g. ${suggestedCleanUrl}` : '/your-pillar-url'}
            onChange={(e) => setForm({ ...form, customRoute: e.target.value })}
            className={customRouteConflict ? 'border-red-400' : ''}
          />
        </Field>
        <Field label="Title" hint="The H1 on the live page">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Intro paragraph" hint="40-60 words. This is what AI engines quote — write it as a direct answer.">
          <Textarea rows={4} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} />
        </Field>
        <Field label="Hero image URL" hint="Optional. CDN URL of the hero image.">
          <Input value={form.heroImageUrl || ''} onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })} />
        </Field>
        <Field
          label="Category tiles (JSON)"
          hint='Array of {"categorySlug","name","blurb"}. Surfaces "Shop by category" tiles on the page.'
        >
          <Textarea
            rows={6}
            value={JSON.stringify(form.categoryTiles, null, 2)}
            onChange={(e) => {
              try {
                setForm({ ...form, categoryTiles: JSON.parse(e.target.value || '[]') });
              } catch {
                // ignore parse errors mid-typing
              }
            }}
          />
        </Field>
        <Field
          label="Sections (JSON)"
          hint='Array of {"heading","body","speakable","featuredProductIds"}. body is HTML.'
        >
          <Textarea
            rows={8}
            value={JSON.stringify(form.sections, null, 2)}
            onChange={(e) => {
              try {
                setForm({ ...form, sections: JSON.parse(e.target.value || '[]') });
              } catch {}
            }}
          />
        </Field>
        <Field label="FAQs (JSON)" hint='Array of {"question","answer"}.'>
          <Textarea
            rows={6}
            value={JSON.stringify(form.faqs, null, 2)}
            onChange={(e) => {
              try {
                setForm({ ...form, faqs: JSON.parse(e.target.value || '[]') });
              } catch {}
            }}
          />
        </Field>
        <Field label="Related pillar slugs (comma-separated)">
          <Input
            value={form.relatedPillarSlugs.join(', ')}
            onChange={(e) =>
              setForm({
                ...form,
                relatedPillarSlugs: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>
        <Field label="Active (publish)">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
        </Field>

        <div className="flex gap-2 pt-2">
          <Button onClick={() => onSave(form)}>Save</Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
