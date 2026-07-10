export function LoadingCard({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-8 animate-scale-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-ring" />
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
      <p className="text-sm text-muted animate-fade-in [animation-delay:0.15s]">
        {label}
      </p>
    </div>
  );
}
