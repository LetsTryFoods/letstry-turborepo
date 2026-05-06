'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  usePressMentions,
  useCreatePressMention,
  useUpdatePressMention,
  useRemovePressMention,
  type PressMention,
} from '@/lib/press-mentions/usePressMentions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Sprint 5 — Press Mention CRUD admin page.
 *
 * Press mentions drive:
 *  - the /press storefront page (list of media coverage)
 *  - NewsArticle JSON-LD blocks emitted from /press for AEO
 *  - homepage / footer "as featured in" rails (when wired)
 *
 * Each entry represents an external article *about* Let's Try Foods. The
 * brand is the entity being covered, not the author of the article.
 */
export default function PressMentionsAdminPage() {
  const { data, loading, refetch } = usePressMentions();
  const { create } = useCreatePressMention();
  const { update } = useUpdatePressMention();
  const { remove } = useRemovePressMention();

  const mentions: PressMention[] =
    (data as { pressMentions?: PressMention[] } | undefined)?.pressMentions || [];
  const [editing, setEditing] = useState<PressMention | null>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Press mentions</h1>
          <p className="text-sm text-gray-500">
            Media coverage of Let&apos;s Try Foods. Drives <code>/press</code> and the
            NewsArticle schema emitted from it.
          </p>
        </div>
        <Button onClick={() => setEditing(emptyMention())}>+ New mention</Button>
      </header>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="grid gap-3">
        {mentions.map((m) => (
          <Card key={m._id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {m.publication}
                <span className="text-xs text-gray-500 ml-2">
                  {m.category && `· ${m.category} `}
                  {m.publishedAt && `· ${formatDate(m.publishedAt)} `}
                  {m.isActive ? '· active' : '· draft'}
                </span>
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(m)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (confirm(`Delete mention from "${m.publication}"?`)) {
                      await remove(m._id);
                      refetch();
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-gray-900 mb-1">{m.headline}</p>
              {m.excerpt && (
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">{m.excerpt}</p>
              )}
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                {m.url}
              </a>
            </CardContent>
          </Card>
        ))}
        {!loading && mentions.length === 0 && (
          <p className="text-sm text-gray-500">
            No press mentions yet. Add the first one — every entry strengthens the
            brand&apos;s E-E-A-T signal and unlocks NewsArticle schema on{' '}
            <code>/press</code>.
          </p>
        )}
      </div>

      {editing && (
        <PressMentionForm
          mention={editing}
          onCancel={() => setEditing(null)}
          onSave={async (input) => {
            const payload = stripServerFields(input as PressMention);
            try {
              if (editing._id) {
                await update(editing._id, payload);
                toast.success(`Mention "${payload.headline}" updated`);
              } else {
                await create(payload as Parameters<typeof create>[0]);
                toast.success(`Mention "${payload.headline}" created`);
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

function stripServerFields(m: PressMention) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, createdAt, updatedAt, ...rest } = m;
  return rest;
}

function emptyMention(): PressMention {
  return {
    _id: '',
    slug: '',
    publication: '',
    headline: '',
    url: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    isActive: true,
    position: 0,
    createdAt: '',
    updatedAt: '',
  };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function PressMentionForm({
  mention,
  onSave,
  onCancel,
}: {
  mention: PressMention;
  onSave: (input: Partial<PressMention>) => void | Promise<void>;
  onCancel: () => void;
}) {
  // Convert the timestamp to a YYYY-MM-DD string for the date input.
  const toDateInput = (iso: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  const [form, setForm] = useState<PressMention>({
    ...mention,
    publishedAt: toDateInput(mention.publishedAt),
  });

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader>
        <CardTitle>{mention._id ? 'Edit mention' : 'New mention'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field
          label="Slug (unique identifier)"
          hint="lowercase-with-dashes, e.g. yourstory-2026-feature"
        >
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </Field>
        <Field label="Publication name" hint='e.g. "YourStory", "The Better India", "Times of India"'>
          <Input
            value={form.publication}
            onChange={(e) => setForm({ ...form, publication: e.target.value })}
          />
        </Field>
        <Field label="Publication logo URL (optional)">
          <Input
            value={form.publicationLogoUrl || ''}
            onChange={(e) =>
              setForm({ ...form, publicationLogoUrl: e.target.value })
            }
          />
        </Field>
        <Field label="Article headline" hint="As it appears on the publication's site">
          <Input
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
          />
        </Field>
        <Field label="Article URL" hint="Canonical link to the article">
          <Input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
        </Field>
        <Field
          label="Excerpt / pull-quote (optional)"
          hint="A short snippet — used as the schema description and a teaser in the press grid"
        >
          <Textarea
            rows={3}
            value={form.excerpt || ''}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
        </Field>
        <Field label="Cover image URL (optional)">
          <Input
            value={form.coverImageUrl || ''}
            onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
          />
        </Field>
        <Field label="Published date">
          <Input
            type="date"
            value={form.publishedAt || ''}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
          />
        </Field>
        <Field
          label="Category (optional)"
          hint="e.g. feature, review, interview, listicle"
        >
          <Input
            value={form.category || ''}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </Field>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span className="text-sm">Active (publish)</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span>Position:</span>
            <Input
              type="number"
              className="w-20"
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: Number(e.target.value) || 0 })
              }
            />
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => {
              // Persist publishedAt as ISO so the GraphQL DateTime scalar
              // accepts it.
              const isoPublishedAt = form.publishedAt
                ? new Date(form.publishedAt).toISOString()
                : new Date().toISOString();
              onSave({ ...form, publishedAt: isoPublishedAt });
            }}
          >
            Save
          </Button>
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
