const ENVIRONMENT_LABELS: Record<string, string> = {
  development: "Desenvolvimento",
  production: "Produção",
  test: "Teste",
};

export type VersionInfo = {
  version: string;
  build: string;
  deploy: string;
  environment: string;
};

/** Informações de versão derivadas de package.json/git/NODE_ENV via next.config.ts — sem valores hardcoded. */
export function getVersionInfo(): VersionInfo {
  const nodeEnv = process.env.NEXT_PUBLIC_NODE_ENV ?? "development";
  return {
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
    build: process.env.NEXT_PUBLIC_GIT_COMMIT ?? "",
    deploy: process.env.NEXT_PUBLIC_BUILD_DATE ?? "",
    environment: ENVIRONMENT_LABELS[nodeEnv] ?? nodeEnv,
  };
}
