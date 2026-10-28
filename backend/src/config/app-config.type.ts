export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  websiteDomain?: string;
  cmsDomain?: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;
  adminUsername?: string;
  adminPassword?: string;
};
