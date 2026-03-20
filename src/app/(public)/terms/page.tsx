import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | GH Control",
  description:
    "Terms of use for GH Control describing service usage, user responsibilities, access controls, and limitations.",
};

const links = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/help", label: "Help" },
  { href: "/privacy", label: "Privacy" },
  { href: "/login", label: "Login" },
];

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "40px 20px 56px" }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ color: "var(--accent-text)", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>
          Legal
        </p>
        <h1 style={{ fontSize: 36, lineHeight: 1.1, color: "var(--text-primary)", marginBottom: 10 }}>
          Terms of Use
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Last updated: March 21, 2026
        </p>
      </header>

      <section className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-primary)", marginBottom: 10 }}>Service Scope</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          GH Control provides a unified GitHub operations dashboard. Features and availability may change as APIs evolve.
        </p>
      </section>

      <section className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-primary)", marginBottom: 10 }}>User Responsibilities</h2>
        <ul style={{ color: "var(--text-secondary)", fontSize: 13, paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>Use valid credentials and secure token practices.</li>
          <li>Grant minimal scopes required for intended operations.</li>
          <li>Comply with GitHub API terms and usage limits.</li>
        </ul>
      </section>

      <section className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-primary)", marginBottom: 10 }}>Liability & Disclaimers</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          GH Control is provided "as is" without guarantees of uninterrupted service. Always validate actions before applying changes to critical repositories.
        </p>
      </section>

      <section className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-primary)", marginBottom: 10 }}>Related Pages</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          See <a href="/privacy" style={{ color: "var(--accent-text)" }}>Privacy</a> for data handling and <a href="/docs" style={{ color: "var(--accent-text)" }}>Docs</a> for operational guidance.
        </p>
      </section>

      <footer style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {links.map((item) => (
          <a key={item.href} href={item.href} style={{ color: "var(--text-secondary)", fontSize: 12 }}>
            {item.label}
          </a>
        ))}
      </footer>
    </main>
  );
}
