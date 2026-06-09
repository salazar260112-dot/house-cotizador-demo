/// <reference types="vite/client" />

declare const __BASE_PATH__: string;
declare const __IS_PREVIEW__: boolean;
declare const __READDY_PROJECT_ID__: string;
declare const __READDY_VERSION_ID__: string;
declare const __READDY_AI_DOMAIN__: string;

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_N8N_WEBHOOK_GENERAR_PDF?: string;
  readonly VITE_APP_BASE_URL?: string;
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_ANON_KEY?: string;
  readonly N8N_WEBHOOK_GENERAR_PDF?: string;
  readonly APP_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
