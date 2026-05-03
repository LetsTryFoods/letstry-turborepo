'use client';

import { useState } from 'react';
import { usePillars, useCreatePillar, useUpdatePillar, useRemovePillar, type Pillar } from '@/lib/pillars/usePillars';
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
                  /p/{p.slug} · {p.isActive ? 'active' : 'draft'}
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
          onCancel={() => setEditing(null)}
          onSave={async (input) => {
            // Strip server-managed fields. The form state IS the full Pillar
            // (including _id / createdAt / updatedAt) but Create/UpdatePillarInput
            // don't accept those — sending them produces a GraphQL "field not
            // defined on input" error and the save fails silently for the
            // content team.
            const payload = stripServerFields(input as Pillar);
            if (editing._id) {
              await update(editing._id, payload);
            } else {
              await create(payload as Parameters<typeof create>[0]);
            }
            setEditing(null);
            refetch();
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
    title: '',
    intro: '',
    heroImageUrl: '',
    categoryTiles: [],
    featuredProductIds: [],
    sections: [],
    faqs: [],
    relatedPillarSlugs: [],
    isActive: false,
    position: 0,
    createdAt: '',
    updatedAt: '',
  };
}

function PillarForm({
  pillar,
  onSave,
  onCancel,
}: {
  pillar: Pillar;
  onSave: (input: Partial<Pillar>) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Pillar>(pillar);

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader>
        <CardTitle>{pillar._id ? 'Edit pillar' : 'New pillar'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Slug (URL path under /p/)" hint="lowercase-with-dashes, e.g. palm-oil-free-namkeen">
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
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
