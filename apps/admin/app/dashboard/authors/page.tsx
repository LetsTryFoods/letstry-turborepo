'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthors, useCreateAuthor, useUpdateAuthor, useRemoveAuthor, type Author } from '@/lib/authors/useAuthors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Sprint 4 — Author / team-member CRUD admin page.
 *
 * Authors drive:
 *  - the /team page (filtered to isTeamMember=true)
 *  - /author/<slug> profile pages
 *  - Person schema linked from blog posts via blog.authorId
 *
 * Populating real Person profiles is the single highest-leverage E-E-A-T
 * action available — Google heavily weights named-author authority for
 * food / health verticals.
 */
export default function AuthorsAdminPage() {
  const { data, loading, refetch } = useAuthors();
  const { create } = useCreateAuthor();
  const { update } = useUpdateAuthor();
  const { remove } = useRemoveAuthor();

  const authors: Author[] = (data as { authors?: Author[] } | undefined)?.authors || [];
  const [editing, setEditing] = useState<Author | null>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Authors / team</h1>
          <p className="text-sm text-gray-500">
            Person profiles for E-E-A-T. Drives <code>/team</code>, <code>/author/&lt;slug&gt;</code>, and blog bylines.
          </p>
        </div>
        <Button onClick={() => setEditing(emptyAuthor())}>+ New person</Button>
      </header>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="grid gap-3">
        {authors.map((a) => (
          <Card key={a._id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {a.name}{' '}
                <span className="text-xs text-gray-500">
                  {a.jobTitle && `· ${a.jobTitle} `}
                  {a.isFounder && '· founder '}
                  {a.isTeamMember && '· team '}
                  {a.isActive ? '· active' : '· draft'}
                </span>
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(a)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (confirm(`Delete author "${a.name}"?`)) {
                      await remove(a._id);
                      refetch();
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 line-clamp-2">{a.bio || '—'}</p>
            </CardContent>
          </Card>
        ))}
        {!loading && authors.length === 0 && (
          <p className="text-sm text-gray-500">
            No authors yet. Start with the founder — set <em>isFounder</em> + <em>isTeamMember</em> + <em>isActive</em>.
          </p>
        )}
      </div>

      {editing && (
        <AuthorForm
          author={editing}
          onCancel={() => setEditing(null)}
          onSave={async (input) => {
            // Strip server-managed fields before sending — the form state is
            // the full Author including _id/createdAt/updatedAt, but the
            // Create/UpdateAuthorInput types don't accept those.
            const payload = stripServerFields(input as Author);
            try {
              if (editing._id) {
                await update(editing._id, payload);
                toast.success(`Author "${payload.name}" updated`);
              } else {
                await create(payload as Parameters<typeof create>[0]);
                toast.success(`Author "${payload.name}" created`);
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

function stripServerFields(a: Author) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, createdAt, updatedAt, ...rest } = a;
  return rest;
}

function emptyAuthor(): Author {
  return {
    _id: '',
    slug: '',
    name: '',
    expertise: [],
    credentials: [],
    socialLinks: [],
    isFounder: false,
    isTeamMember: false,
    isActive: true,
    position: 0,
    createdAt: '',
    updatedAt: '',
  };
}

function AuthorForm({
  author,
  onSave,
  onCancel,
}: {
  author: Author;
  onSave: (input: Partial<Author>) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Author>(author);
  // Track the raw JSON text the user is typing in the socialLinks textarea
  // separately from the parsed value on `form.socialLinks`. This is so that:
  //  (a) typing an intermediate state like `[{` doesn't lose the user's
  //      input (previously the silent catch swallowed updates entirely);
  //  (b) we can show a clear inline error and block save when the JSON is
  //      invalid, instead of silently saving the LAST valid value.
  const [socialLinksText, setSocialLinksText] = useState(() =>
    JSON.stringify(author.socialLinks || [], null, 2),
  );
  const [socialLinksError, setSocialLinksError] = useState<string | null>(null);

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader>
        <CardTitle>{author._id ? 'Edit person' : 'New person'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Slug (URL path under /author/)" hint="lowercase-with-dashes, e.g. krishna-seth">
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </Field>
        <Field label="Full name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Job title / role">
          <Input value={form.jobTitle || ''} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
        </Field>
        <Field label="Bio (HTML)" hint="3-5 paragraphs. Mention domain expertise, years in food / nutrition / parenting.">
          <Textarea rows={6} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </Field>
        <Field label="Photo URL">
          <Input value={form.photoUrl || ''} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
        </Field>
        <Field label="Public email (optional)">
          <Input value={form.publicEmail || ''} onChange={(e) => setForm({ ...form, publicEmail: e.target.value })} />
        </Field>
        <Field label="Areas of expertise (comma-separated)" hint='Drives Schema.org "knowsAbout"'>
          <Input
            value={form.expertise.join(', ')}
            onChange={(e) =>
              setForm({ ...form, expertise: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
            }
          />
        </Field>
        <Field label="Credentials (comma-separated)" hint="e.g. RD, MSc Nutrition, journalist">
          <Input
            value={form.credentials.join(', ')}
            onChange={(e) =>
              setForm({
                ...form,
                credentials: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </Field>
        <Field
          label="Social links (JSON)"
          hint={
            socialLinksError
              ? `⚠️ ${socialLinksError} — fix the JSON or save will be blocked.`
              : 'Array of {"platform","url"}. Drives Schema.org sameAs (Knowledge Graph signal).'
          }
        >
          <Textarea
            rows={4}
            value={socialLinksText}
            className={socialLinksError ? 'border-red-400' : ''}
            onChange={(e) => {
              const next = e.target.value;
              setSocialLinksText(next);
              try {
                const parsed = JSON.parse(next || '[]');
                if (!Array.isArray(parsed)) {
                  setSocialLinksError('Must be a JSON array of {platform, url} objects');
                  return;
                }
                setSocialLinksError(null);
                setForm({ ...form, socialLinks: parsed });
              } catch (err) {
                setSocialLinksError(`Invalid JSON: ${(err as Error).message}`);
              }
            }}
          />
        </Field>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isFounder}
              onChange={(e) => setForm({ ...form, isFounder: e.target.checked })}
            />
            <span className="text-sm">Founder</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isTeamMember}
              onChange={(e) => setForm({ ...form, isTeamMember: e.target.checked })}
            />
            <span className="text-sm">Show on /team</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span className="text-sm">Active (publish)</span>
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => {
              if (socialLinksError) return; // safety net; button is disabled
              onSave(form);
            }}
            disabled={!!socialLinksError}
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
