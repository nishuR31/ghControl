"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { GitBranch, GitPullRequest, Zap, Shield } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)" }}>
      {/* Header/Nav */}
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-.01em",
          }}
        >
          GH Control
        </h1>
        <button
          onClick={() => router.push("/login")}
          className="btn btn-solid"
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Sign In
        </button>
      </div>

      {/* Hero Section */}
      <div
        style={{
          padding: "4rem 1.5rem",
          textAlign: "center",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-.02em",
            marginBottom: "1.25rem",
            lineHeight: 1.1,
          }}
        >
          GitHub Command Center
        </h2>
        <p
          style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            marginBottom: "2.5rem",
            maxWidth: "600px",
            margin: "0 auto 2.5rem",
          }}
        >
          Everything you need to manage your GitHub environment in one place. No
          scattered tabs, no OAuth setup—just your PAT token and instant
          control.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            marginBottom: "4rem",
          }}
        >
          <button
            onClick={() => router.push("/login")}
            className="btn btn-solid"
            style={{
              padding: "12px 28px",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Get Started →
          </button>
          <button
            onClick={() => router.push("/docs")}
            className="btn btn-ghost"
            style={{
              padding: "12px 28px",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            View Docs
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "2rem",
            marginBottom: "4rem",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "var(--accent)",
                marginBottom: "0.5rem",
              }}
            >
              8+
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Features
            </p>
          </div>
          <div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "var(--accent)",
                marginBottom: "0.5rem",
              }}
            >
              0
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              OAuth Setup
            </p>
          </div>
          <div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "var(--accent)",
                marginBottom: "0.5rem",
              }}
            >
              1
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Integration
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "2rem",
        }}
      >
        <div
          className="card"
          style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 8,
              background: "var(--accent-soft)",
              marginBottom: "1.25rem",
            }}
          >
            <GitBranch size={24} color="var(--accent-text)" />
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            Single Dashboard
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            View all repos, branches, and PRs in one unified interface
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 8,
              background: "var(--accent-soft)",
              marginBottom: "1.25rem",
            }}
          >
            <Zap size={24} color="var(--accent-text)" />
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            Real-time Jobs
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Track BullMQ jobs and webhook events with Redis-backed caching
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 8,
              background: "var(--accent-soft)",
              marginBottom: "1.25rem",
            }}
          >
            <Shield size={24} color="var(--accent-text)" />
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            No OAuth Setup
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Just your PAT token. Simple, fast, secure authentication
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 8,
              background: "var(--accent-soft)",
              marginBottom: "1.25rem",
            }}
          >
            <GitPullRequest size={24} color="var(--accent-text)" />
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            Instant Actions
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Manage webhooks, view issues, and handle PRs without context
            switching
          </p>
        </div>
      </div>

      {/* Problem/Solution Matrix */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "4rem auto",
          padding: "0 1.5rem",
        }}
      >
        <h3
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          Problems We Solve
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            {
              problem: "Managing multiple repos is tedious",
              solution: "Single table view of all your repos",
            },
            {
              problem: "GitHub UI is scattered across many pages",
              solution: "Everything in one unified dashboard",
            },
            {
              problem: "Webhooks are hard to debug",
              solution: "Real-time event logs with MongoDB backup",
            },
            {
              problem: "Job queues are opaque",
              solution: "Full BullMQ visibility with timeline view",
            },
            {
              problem: "No centralized control panel",
              solution: "Power-user interface for all GitHub operations",
            },
            {
              problem: "OAuth setup is complex",
              solution: "PAT token only—instant authentication",
            },
            {
              problem: "GitHub Actions are hard to monitor",
              solution: "Real-time workflow and commit tracking",
            },
            {
              problem: "Multi-tab navigation is slow",
              solution: "Instant search and navigation between resources",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                padding: "1.5rem",
                borderRadius: 8,
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--red-text)",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  Problem
                </p>
                <p style={{ fontSize: 14, color: "var(--text-primary)" }}>
                  {item.problem}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--green-text)",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  Solution
                </p>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                  {item.solution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "4rem auto 3rem",
          padding: "0 1.5rem",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "1.5rem",
          }}
        >
          Ready to take control?
        </h3>
        <button
          onClick={() => router.push("/login")}
          className="btn btn-solid"
          style={{
            padding: "12px 32px",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Start Free →
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "2rem 1.5rem",
          color: "var(--text-tertiary)",
          fontSize: 12,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <a href="/docs" style={{ color: "var(--text-secondary)" }}>Docs</a>
          <a href="/help" style={{ color: "var(--text-secondary)" }}>Help</a>
          <a href="/privacy" style={{ color: "var(--text-secondary)" }}>Privacy</a>
          <a href="/terms" style={{ color: "var(--text-secondary)" }}>Terms</a>
          <a href="/login" style={{ color: "var(--text-secondary)" }}>Login</a>
        </div>
        © 2026 GH Control. Built with Next.js, Redis, MongoDB & BullMQ.
      </div>
    </div>
  );
}
