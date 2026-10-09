/// <reference types="vite/client" />

// Raw, untyped values as injected by Vite. Consume them through `@/shared/lib/env`,
// which validates and coerces them, rather than reading `import.meta.env` directly.
type ImportMetaEnv = {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENABLE_MOCKS?: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
