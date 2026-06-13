import packageJson from "../../package.json";

const ENVIRONMENT_LABELS: Record<string, string> = {
  development: "Desenvolvimento",
  preview: "Homologação",
  production: "Produção",
};

const SHORT_SHA_LENGTH = 7;

export type AppMetadata = {
  version: string;
  build: string;
  deploy: string;
  environment: string;
};

/** Metadados de build derivados de package.json, git/Vercel e do ambiente de execução — sem valores fixos no código. */
export function getAppMetadata(): AppMetadata {
  const gitSha = process.env.NEXT_PUBLIC_GIT_SHA ?? "";
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE ?? "";
  const environmentKey =
    process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development";

  return {
    version: packageJson.version,
    build: gitSha ? gitSha.slice(0, SHORT_SHA_LENGTH) : "local",
    deploy: buildDate || new Date().toISOString(),
    environment: ENVIRONMENT_LABELS[environmentKey] ?? environmentKey,
  };
}
