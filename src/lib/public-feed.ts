import { parsePublicCollection } from '@/lib/utils';

export function decodePublicFeedPayload(rawText: string) {
  let rawPayload: unknown;

  try {
    rawPayload = JSON.parse(rawText);
  } catch {
    throw new Error('The public export is malformed JSON.');
  }

  try {
    return parsePublicCollection(rawPayload);
  } catch {
    throw new Error('The public export is missing required fields or has an invalid items array.');
  }
}
