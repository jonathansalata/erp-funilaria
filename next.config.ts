import { execSync } from "child_process";

import type { NextConfig } from "next";

function getGitCommitSha(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA;
  }

  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "";
  }
}

function getGitCommitDate(): string {
  try {
    return execSync("git log -1 --format=%cI").toString().trim();
  } catch {
    return "";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_SHA: getGitCommitSha(),
    NEXT_PUBLIC_BUILD_DATE: getGitCommitDate() || new Date().toISOString(),
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "",
  },
};

export default nextConfig;
