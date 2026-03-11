import { DATA_SUFFIX } from "../app/providers";

/**
 * Appends the Base Builder Code (ERC-8021) attribution suffix to transaction data.
 * This is critical for ensuring attribution when using custom connectors like Farcaster.
 */
export const withAttribution = (data: `0x${string}`) =>
  `${data}${DATA_SUFFIX.slice(2)}` as `0x${string}`;
