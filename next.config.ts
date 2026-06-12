import { execSync } from "child_process";

import type { NextConfig } from "next";

import packageJson from "./package.json";

function getGitCommit(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
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
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_GIT_COMMIT: getGitCommit(),
    NEXT_PUBLIC_BUILD_DATE: getGitCommitDate() || new Date().toISOString(),
  },
};

export default nextConfig;
