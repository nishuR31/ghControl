import { GitHubLoader } from "@/components/landing/github-loader";

export default function Loading() {
  return (
    <div className="landing-shell landing-loading-shell">
      <GitHubLoader label="Booting GH Control" />
    </div>
  );
}
