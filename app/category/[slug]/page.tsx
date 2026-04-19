import { redirect } from 'next/navigation';

interface CategoryRedirectPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    subcategory?: string | string[];
  };
}

export default function CategoryRedirectPage({
  params,
  searchParams,
}: CategoryRedirectPageProps) {
  const slug = String(params.slug || '').trim();
  const rawSubcategory = searchParams?.subcategory;
  const subcategory = Array.isArray(rawSubcategory)
    ? rawSubcategory[0]
    : rawSubcategory;

  const categoryParam = encodeURIComponent(slug);
  const subcategoryParam = subcategory
    ? `&subcategory=${encodeURIComponent(subcategory)}`
    : '';

  redirect(`/products?category=${categoryParam}${subcategoryParam}`);
}
