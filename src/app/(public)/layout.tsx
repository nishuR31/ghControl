import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "GH Control",
    template: "%s | GH Control",
  },
  openGraph: {
    type: "website",
    siteName: "GH Control",
  },
};

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
