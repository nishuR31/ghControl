type GitHubLoaderProps = {
  label?: string;
};

export function GitHubLoader({
  label = "Loading GH Control",
}: GitHubLoaderProps) {
  return (
    <div className="github-loader" role="status" aria-live="polite">
      <svg
        viewBox="0 0 120 120"
        className="github-loader-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="gh-loader-stroke"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--accent-text)" />
            <stop offset="100%" stopColor="var(--blue-text)" />
          </linearGradient>
        </defs>
        <circle className="github-loader-ring" cx="60" cy="60" r="34" />
        <path
          className="github-loader-path"
          d="M42 66c5-8 11-12 18-12s13 4 18 12"
        />
        <circle className="github-loader-node node-a" cx="42" cy="66" r="4" />
        <circle className="github-loader-node node-b" cx="60" cy="54" r="4" />
        <circle className="github-loader-node node-c" cx="78" cy="66" r="4" />
        <path
          className="github-loader-glyph"
          d="M60 26c18 0 33 15 33 33 0 14-8 26-20 31-2 1-3 0-3-2v-8c0-2-1-3-3-4 0 0-1 0-2 1-2 1-5 2-8 2s-6-1-8-2c-1-1-2-1-2-1-2 1-3 2-3 4v8c0 2-1 3-3 2-12-5-20-17-20-31 0-18 15-33 33-33Z"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}
