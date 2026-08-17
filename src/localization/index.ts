import en from "./locales/en.json";
import mn from "./locales/mn.json";
import type { Language } from "../types";

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  en,
  mn,
};

export const getDictionary = (language: Language): Dictionary => dictionaries[language] ?? dictionaries.en;

export const translate = (
  language: Language,
  key: string,
  vars?: Record<string, string | number>
): string => {
  const dict = getDictionary(language);
  const template = dict[key] ?? dictionaries.en[key] ?? key;
  if (!vars) {
    return template;
  }

  return Object.entries(vars).reduce(
    (acc, [varKey, value]) => acc.split(`{{${varKey}}}`).join(String(value)),
    template
  );
};