import { toLogError } from "@/utils/to-logger-error";
import logger from "./logger";

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    logger.debug("Fetching URL", { url, timeoutMs });
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Request timed out after ${timeoutMs}ms`, { cause: error });
    }
    logger.error(`Error fetching URL with timeout: ${url}`, toLogError(error));
    throw new Error("Fetch failed", { cause: error });
  } finally {
    clearTimeout(timer);
  }
}