export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-l-lg p-6 bg-white" style={{ minHeight: '100%' }}>
      {children}
    </div>
  );
}
