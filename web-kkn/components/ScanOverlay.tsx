export function ScanOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center animate-fade-in"
      aria-hidden
    >
      {/* Sudut frame scan */}
      <div className="relative w-[78%] aspect-square">
        <span className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-primary rounded-tl-lg animate-corner-pulse" />
        <span className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-primary rounded-tr-lg animate-corner-pulse [animation-delay:0.2s]" />
        <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-primary rounded-bl-lg animate-corner-pulse [animation-delay:0.4s]" />
        <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-primary rounded-br-lg animate-corner-pulse [animation-delay:0.6s]" />

        {/* Garis scan */}
        <div className="absolute left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line shadow-[0_0_8px_rgba(198,138,62,0.6)]" />
      </div>

      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/90 font-medium drop-shadow-md">
        Arahkan QR ke dalam kotak
      </p>
    </div>
  );
}
