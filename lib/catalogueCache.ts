import { revalidatePath, revalidateTag } from 'next/cache';

// Called only after successful admin writes; prices/visibility refresh on the next visit.
export function invalidateCatalogue() {
  revalidateTag('catalogue');
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/product/[id]', 'page');
}
