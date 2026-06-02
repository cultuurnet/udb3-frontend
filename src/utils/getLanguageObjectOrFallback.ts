import { SupportedLanguage, SupportedLanguages } from '../i18n';

const getLanguageObjectOrFallback = <TReturned>(
  obj: any,
  language: SupportedLanguage,
  mainLanguage?: SupportedLanguage,
) => {
  if (obj == null) return;

  // Plain value (string / number) — already the leaf, return as-is.
  if (typeof obj !== 'object') return obj as TReturned;

  if (obj[language]) return obj[language] as TReturned;
  if (mainLanguage && obj[mainLanguage]) return obj[mainLanguage] as TReturned;
  if (obj[SupportedLanguages.NL]) return obj[SupportedLanguages.NL] as TReturned;

  // Final fallback: first available value on the multilingual map.
  // Prevents callers from ever receiving the raw `{ nl?, fr?, … }` object,
  // which React can't render and downstream code can't treat as a leaf.
  const firstValue = Object.values(obj).find((v) => v != null);
  return firstValue as TReturned | undefined;
};

export { getLanguageObjectOrFallback };
