import { z, type ZodType } from 'zod';
import { createJSONStorage, type PersistStorage, type StorageValue } from 'zustand/middleware';

export type ValidatedStorageOptions<S> = {
  /** Validates the persisted `state`; anything that fails is discarded. */
  schema: ZodType<S>;
  /** Stored entries written under a different version are discarded. */
  version: number;
};

/**
 * A zustand `persist` storage backed by `localStorage` that validates what it reads.
 *
 * Browsers hand back whatever was last written, including JSON from an older release or
 * something a user edited by hand. Instead of letting that reach a store, a read is parsed
 * with `schema` and the `version` is checked; on corrupt JSON, a failed parse or a version
 * mismatch the entry is treated as absent so the store starts from its defaults.
 *
 * Pass the same `version` to the `persist` options so a bump invalidates old entries.
 */
export function createValidatedStorage<S>({
  schema,
  version,
}: ValidatedStorageOptions<S>): PersistStorage<S> {
  const storedValueSchema = z.object({ state: schema, version: z.literal(version) });
  const jsonStorage = createJSONStorage<S>(() => localStorage);

  function validate(value: unknown): StorageValue<S> | null {
    const result = storedValueSchema.safeParse(value);
    return result.success ? result.data : null;
  }

  return {
    getItem: (name) => {
      if (!jsonStorage) {
        return null;
      }
      try {
        const value = jsonStorage.getItem(name);
        return value instanceof Promise ? value.then(validate, () => null) : validate(value);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      jsonStorage?.setItem(name, value);
    },
    removeItem: (name) => {
      jsonStorage?.removeItem(name);
    },
  };
}
