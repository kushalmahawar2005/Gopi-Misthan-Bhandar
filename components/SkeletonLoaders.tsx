/**
 * Reusable skeleton loaders for Core Web Vitals improvement.
 * Using skeletons instead of spinners prevents LCP degradation
 * since the page structure is visible immediately.
 */

// Simple full-page skeleton with a grid of product cards
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="skeleton w-full aspect-square rounded-[20px]" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// Product detail page skeleton
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
        {/* Info skeleton */}
        <div className="space-y-4">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-10 w-1/3 rounded" />
          <div className="flex gap-3">
            <div className="skeleton h-12 w-full rounded-lg" />
            <div className="skeleton h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Category/Products page skeleton  
export function CategorySkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner skeleton */}
      <div className="skeleton w-full h-[180px]" />
      {/* Filter pill skeleton */}
      <div className="flex gap-2 p-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}

// Simple inline spinner (for buttons only - not page-level loading)
export function ButtonSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-current ${className}`} />
  );
}

// Generic content skeleton rows (for orders, profile, etc.)
export function ContentSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="skeleton h-16 w-16 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}
