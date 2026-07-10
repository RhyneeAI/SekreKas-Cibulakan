import Image from "next/image";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-cream px-4 py-6 sm:py-8">
      <div className="max-w-sm mx-auto w-full">
        <header className="flex flex-col items-center mb-6 text-center animate-fade-in-down">
          <div className="bg-white/70 border border-border rounded-full p-2 mb-3 shadow-sm animate-scale-in">
            <Image
              src="/logo.png"
              alt="Logo SekreKas Cibulakan"
              width={72}
              height={72}
              className="rounded-full"
              priority
            />
          </div>
          <p className="text-xs font-medium text-secondary uppercase tracking-wider">
            SekreKas Cibulakan
          </p>
          <h1 className="text-2xl font-bold text-text mt-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted mt-2 leading-relaxed">{subtitle}</p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
