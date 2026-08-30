/**
 * JoeyPalma ESP Migration Compatibility Layer
 * Re-routes legacy QualityCloudsMCP references directly to JoeyPalma Enhanced Secure Protocol.
 */
export { JoeyPalmaESPServer as QualityCloudsMCPServer } from './joeyPalmaESP';
export type { JoeyPalmaESPResult as QualityCloudsResult } from './joeyPalmaESP';
