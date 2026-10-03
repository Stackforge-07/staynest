export default function SkeletonCard() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="card-body">
        <div className="skeleton skeleton-line skeleton-short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-medium" />
      </div>
    </div>
  );
}
