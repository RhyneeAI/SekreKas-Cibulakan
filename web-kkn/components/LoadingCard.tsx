export function LoadingCard({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-8">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
