import packageJson from "../../package.json";

export const APP_VERSION = packageJson.version;
export const BUILD_DATE = new Date().toISOString();