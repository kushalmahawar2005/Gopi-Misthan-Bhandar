const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

export const slugifyText = (value: string): string => {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
};

export const extractObjectIdFromSlug = (slugOrId: string): string | null => {
  if (!slugOrId) return null;

  const normalized = slugOrId.toLowerCase();
  if (OBJECT_ID_REGEX.test(normalized)) return normalized;

  const match = normalized.match(/([a-f0-9]{24})$/);
  return match ? match[1] : null;
};

export const buildProductSlug = (name: string, id: string): string => {
  const base = slugifyText(name) || 'product';
  const objectId = extractObjectIdFromSlug(id);

  return objectId ? `${base}-${objectId}` : base;
};

export const buildBlogSlug = (title: string, id: string): string => {
  const base = slugifyText(title) || 'blog';
  const objectId = extractObjectIdFromSlug(id);

  return objectId ? `${base}-${objectId}` : base;
};