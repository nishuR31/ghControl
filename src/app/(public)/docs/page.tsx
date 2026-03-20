import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs | GH Control",
  description:
    "GH Control documentation for setup, token scopes, dashboard usage, jobs, webhooks, and troubleshooting.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "Docs | GH Control",
    description:
      "Setup, token scopes, dashboard usage, jobs, webhooks, and troubleshooting guides for GH Control.",
    url: "/docs",
  },
};

const links = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/help", label: "Help" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function DocsPage() {
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
          GH Control Documentation
        </p>
        <h1
          style={{
            fontSize: 36,
            lineHeight: 1.1,
            color: "var(--text-primary)",
            marginBottom: 10,
          }}
        >
          Docs
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Setup, usage, and troubleshooting for your GitHub command center.
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
          Quick Start
        </h2>
        <ol
          style={{
            color: "var(--text-secondary)",
            paddingLeft: 20,
            display: "grid",
            gap: 8,
          }}
        >
          <li>
            Create a GitHub Personal Access Token from GitHub settings.
            <span style={{ marginLeft: 8 }}>
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 8px",
                  borderRadius: 999,
                  border: "1px solid var(--accent-border)",
                  background: "var(--accent-soft)",
                  color: "var(--accent-text)",
                  fontSize: 11.5,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Go to tokens <span aria-hidden="true">↗</span>
              </a>
            </span>
          </li>
          <li>
            Enable scopes: <strong>repo</strong>, <strong>read:user</strong>,{" "}
            <strong>admin:repo_hook</strong>, <strong>notifications</strong>.
          </li>
          <li>
            Open{" "}
            <a href="/login" style={{ color: "var(--accent-text)" }}>
              Login
            </a>{" "}
            and paste your token.
          </li>
          <li>
            Access{" "}
            <a href="/dashboard" style={{ color: "var(--accent-text)" }}>
              Dashboard
            </a>{" "}
            to manage repos, PRs, jobs, and webhook events.
          </li>
        </ol>
      </section>

      <section className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2
          style={{
            fontSize: 18,
            color: "var(--text-primary)",
            marginBottom: 10,
          }}
        >
          Core Modules
        </h2>
        <ul
          style={{
            color: "var(--text-secondary)",
            paddingLeft: 20,
            display: "grid",
            gap: 8,
          }}
        >
          <li>
            Repositories, branches, commits, issues, pull requests, releases
          </li>
          <li>Notifications and stars overview</li>
          <li>BullMQ jobs panel and retry/error visibility</li>
          <li>Webhook events with Redis + MongoDB logging</li>
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
          Troubleshooting
        </h2>
        <ul
          style={{
            color: "var(--text-secondary)",
            paddingLeft: 20,
            display: "grid",
            gap: 8,
          }}
        >
          <li>
            Invalid token: verify scope and expiration in GitHub settings.
          </li>
          <li>
            Missing data: re-check repo access permissions for your token.
          </li>
          <li>Slow responses: validate Redis and queue worker health.</li>
          <li>Webhook gaps: inspect events log and delivery status.</li>
        </ul>
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
