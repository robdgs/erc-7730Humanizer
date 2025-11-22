import type { ERC7730Descriptor } from "./types";

let cachedDescriptor: ERC7730Descriptor | null = null;

/**
 * Load ERC-7730 descriptor from public directory
 * Caches the result for subsequent calls
 */
export async function loadDescriptor(): Promise<ERC7730Descriptor> {
  if (cachedDescriptor) {
    return cachedDescriptor;
  }

  const response = await fetch("/descriptors/DemoRouter.json");
  if (!response.ok) {
    throw new Error("Failed to load ERC-7730 descriptor");
  }

  const data = await response.json();
  cachedDescriptor = data;
  return data;
}

/**
 * Clear descriptor cache (useful for testing or updates)
 */
export function clearDescriptorCache(): void {
  cachedDescriptor = null;
}

/**
 * Load descriptor from custom URL
 */
export async function loadDescriptorFrom(
  url: string
): Promise<ERC7730Descriptor> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load descriptor from ${url}`);
  }

  return await response.json();
}
