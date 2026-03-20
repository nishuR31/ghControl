export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        background: "var(--bg-app)",
      }}
    >
      {children}
    </div>
  );
}
