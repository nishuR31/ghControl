import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | GH Control",
  description: "Sign in to GH Control using your GitHub personal access token.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
