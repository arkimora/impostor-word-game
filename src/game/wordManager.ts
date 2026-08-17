import type { GameWord, Language } from "../types";
import { pickRandom } from "./randomizer";

export const getEnabledWords = (words: GameWord[], languageFilter: "all" | Language): GameWord[] =>
  words.filter((word) => word.enabled && (languageFilter === "all" || word.language === languageFilter));

export const pickWordWithHistory = (
  words: GameWord[],
  recentWordIds: string[],
  languageFilter: "all" | Language
): GameWord | null => {
  const enabled = getEnabledWords(words, languageFilter);
  if (!enabled.length) {
    return null;
  }

  const eligible = enabled.filter((word) => !recentWordIds.includes(word.id));
  const pool = eligible.length >= 3 ? eligible : enabled;
  return pickRandom(pool);
};

export const addWordToRecentHistory = (recentWordIds: string[], wordId: string, max = 16): string[] => {
  const next = [wordId, ...recentWordIds.filter((id) => id !== wordId)];
  return next.slice(0, max);
};