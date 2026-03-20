import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | GH Control",
  description:
    "Privacy policy for GH Control, including token handling, local storage, telemetry boundaries, and security practices.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | GH Control",
    description:
      "How GH Control handles tokens, local storage, and operational data for dashboard reliability and security.",
    url: "/privacy",
  },
};

const links = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/help", label: "Help" },
  { href: "/terms", label: "Terms" },
  { href: "/login", label: "Login" },
];

export default function PrivacyPage() {
  return (
    <main
      style={{ maxWidth: 980, margin: "0 auto", padding: "40px 20px 56px" }}
    >
      <header style={{ marginBottom: 24 }}>
        <p
          style={{
            color: "var(--accent-text)",
            fontSize: 12,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Legal
        </p>
        <h1
          style={{
            fontSize: 36,
            lineHeight: 1.1,
            color: "var(--text-primary)",
            marginBottom: 10,
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Last updated: March 21, 2026
        </p>
      </header>

      <section className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2
          style={{
            fontSize: 18,
            color: "var(--text-primary)",
            marginBottom: 10,
          }}
        >
          Data We Process
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          GH Control processes GitHub API responses necessary to render your
          dashboard, including repositories, pull requests, notifications, and
          webhook events.
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          Personal Access Tokens are used for authenticated API requests and
          should be managed by you with minimum required scopes.
        </p>
      </section>

      <section className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2
          style={{
            fontSize: 18,
            color: "var(--text-primary)",
            marginBottom: 10,
          }}
        >
          Storage & Retention
        </h2>
        <ul
          style={{
            color: "var(--text-secondary)",
            fontSize: 13,
            paddingLeft: 20,
            display: "grid",
            gap: 8,
          }}
        >
          <li>
            Session state may be stored in browser local storage for login
            persistence.
          </li>
          <li>
            Operational logs may be stored for troubleshooting and queue
            observability.
          </li>
          <li>You can revoke tokens anytime from GitHub settings.</li>
        </ul>
      </section>

      <section className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2
          style={{
            fontSize: 18,
            color: "var(--text-primary)",
            marginBottom: 10,
          }}
        >
          Related Pages
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          See{" "}
          <a href="/terms" style={{ color: "var(--accent-text)" }}>
            Terms
          </a>{" "}
          for usage conditions and{" "}
          <a href="/help" style={{ color: "var(--accent-text)" }}>
            Help
          </a>{" "}
          for support guidance.
        </p>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: 14,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {links.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{ color: "var(--text-secondary)", fontSize: 12 }}
          >
            {item.label}
          </a>
        ))}
      </footer>
    </main>
  );
}
