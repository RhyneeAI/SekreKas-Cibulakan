type AlertProps = {
  type: "success" | "error" | "info";
  children: React.ReactNode;
};

const styles = {
  success: "bg-success/10 border-success/30 text-success",
  error: "bg-danger/10 border-danger/30 text-danger",
  info: "bg-primary/10 border-primary/30 text-secondary",
};

export function Alert({ type, children }: AlertProps) {
  return (
    <div
      className={`mt-4 px-4 py-3 rounded-xl border text-sm text-center animate-fade-in-up ${styles[type]}`}
      role="alert"
    >
      {children}
    </div>
  );
}
