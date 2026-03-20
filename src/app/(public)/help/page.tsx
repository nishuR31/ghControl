import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help | GH Control",
  description:
    "Help center for GH Control: account setup, token issues, dashboard troubleshooting, and support guidance.",
  alternates: {
    canonical: "/help",
  },
  openGraph: {
    title: "Help | GH Control",
    description:
      "Support and troubleshooting guidance for GH Control setup, permissions, and dashboard operations.",
    url: "/help",
  },
};

const links = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/login", label: "Login" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function HelpPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "40px 20px 56px" }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ color: "var(--accent-text)", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>
          GH Control Support
        </p>
        <h1 style={{ fontSize: 36, lineHeight: 1.1, color: "var(--text-primary)", marginBottom: 10 }}>
          Help
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Common answers for setup, permissions, and dashboard operations.
        </p>
      </header>

      <section className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-primary)", marginBottom: 10 }}>Frequently Asked Questions</h2>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <h3 style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 5 }}>Why can’t I login?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Check PAT format and required scopes in <a href="/docs" style={{ color: "var(--accent-text)" }}>Docs</a>.</p>
          </div>
          <div>
            <h3 style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 5 }}>Why are webhooks empty?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Ensure webhook scope is enabled and delivery events are active in your repository.</p>
          </div>
          <div>
            <h3 style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 5 }}>Is my token stored remotely?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Review storage behavior in <a href="/privacy" style={{ color: "var(--accent-text)" }}>Privacy Policy</a>.</p>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: "var(--text-primary)", marginBottom: 10 }}>Need More Help?</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          For implementation details, start with <a href="/docs" style={{ color: "var(--accent-text)" }}>Docs</a>. For legal and data policies, check <a href="/terms" style={{ color: "var(--accent-text)" }}>Terms</a> and <a href="/privacy" style={{ color: "var(--accent-text)" }}>Privacy</a>.
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
