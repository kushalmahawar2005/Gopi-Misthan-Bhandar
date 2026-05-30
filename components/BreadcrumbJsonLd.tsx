const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gopimisthanbhandar.com';

type Crumb = {
  /** Display name shown in the breadcrumb trail */
  name: string;
  /** Path relative to the site root, e.g. "/products" (omit for the current page) */
  path?: string;
};

/**
 * Emits BreadcrumbList JSON-LD. Helps Google understand site hierarchy,
 * which is a strong signal for sitelinks + breadcrumb rich results.
 * Server-safe (no client hooks) so it can be used inside layouts.
 */
export default function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${BASE_URL}${crumb.path ?? ''}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
