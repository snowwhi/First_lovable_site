const BlogSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-border bg-card">
    <div className="aspect-video skeleton-shimmer" />
    <div className="p-5 space-y-3">
      <div className="h-6 w-3/4 rounded skeleton-shimmer" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded skeleton-shimmer" />
        <div className="h-4 w-5/6 rounded skeleton-shimmer" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 w-16 rounded skeleton-shimmer" />
        <div className="h-3 w-20 rounded skeleton-shimmer" />
      </div>
    </div>
  </div>
);

export const PostDetailSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
    <div className="h-10 w-2/3 rounded skeleton-shimmer" />
    <div className="flex gap-4">
      <div className="h-4 w-24 rounded skeleton-shimmer" />
      <div className="h-4 w-32 rounded skeleton-shimmer" />
    </div>
    <div className="aspect-video rounded-xl skeleton-shimmer" />
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-4 rounded skeleton-shimmer" style={{ width: `${85 + Math.random() * 15}%` }} />
      ))}
    </div>
  </div>
);

export default BlogSkeleton;
