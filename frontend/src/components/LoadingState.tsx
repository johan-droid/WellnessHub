export function LoadingSkeleton({
  rows = 3,
  variant = 'card',
}: {
  rows?: number;
  variant?: 'card' | 'table' | 'list';
}) {
  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-xl p-6 bg-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-gray-100 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return null;
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
