import { defaultWords } from "../data/defaultWords";
import type { AppSettings, GameWord, RoundPreferences, RoundState, StorageResult } from "../types";

const KEYS = {
  settings: "impostor.settings.v1",
  words: "impostor.words.v1",
  recentWords: "impostor.recentWords.v1",
  activeRound: "impostor.activeRound.v1",
  roundPreferences: "impostor.roundPreferences.v1",
} as const;

export const defaultSettings: AppSettings = {
  language: "en",
  impostorCount: 1,
  votingDuration: 60,
  theme: "light",
  hintMode: "local",
  soundEnabled: true,
  onlineApiKey: "",
};

export const defaultRoundPreferences: RoundPreferences = {
  players: ["Alex", "Sarah", "Bat"],
  languageFilter: "all",
};

const parseStorage = <T>(key: string, fallback: T): StorageResult<T> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { ok: true, value: fallback };
    }
    return { ok: true, value: JSON.parse(raw) as T };
  } catch {
    return { ok: false, value: fallback, error: "storage_error" };
  }
};

const writeStorage = <T>(key: string, value: T): StorageResult<T> => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true, value };
  } catch {
    return { ok: false, value, error: "storage_error" };
  }
};

export const loadSettings = (): StorageResult<AppSettings> => {
  const result = parseStorage<AppSettings>(KEYS.settings, defaultSettings);
  return { ...result, value: { ...defaultSettings, ...result.value } };
};

export const saveSettings = (settings: AppSettings) => writeStorage(KEYS.settings, settings);

export const loadWords = (): StorageResult<GameWord[]> => {
  const result = parseStorage<GameWord[]>(KEYS.words, defaultWords);
  const words = result.value.length ? result.value : defaultWords;
  return { ...result, value: words };
};

export const saveWords = (words: GameWord[]) => writeStorage(KEYS.words, words);

export const resetWordsToDefault = () => writeStorage(KEYS.words, defaultWords);

export const loadRecentWords = (): StorageResult<string[]> => parseStorage<string[]>(KEYS.recentWords, []);

export const saveRecentWords = (wordIds: string[]) => writeStorage(KEYS.recentWords, wordIds.slice(0, 18));

export const loadActiveRound = (): StorageResult<RoundState | null> => parseStorage<RoundState | null>(KEYS.activeRound, null);

export const saveActiveRound = (state: RoundState | null) => writeStorage(KEYS.activeRound, state);

export const loadRoundPreferences = (): StorageResult<RoundPreferences> => {
  const result = parseStorage<RoundPreferences>(KEYS.roundPreferences, defaultRoundPreferences);
  return { ...result, value: { ...defaultRoundPreferences, ...result.value } };
};

export const saveRoundPreferences = (value: RoundPreferences) => writeStorage(KEYS.roundPreferences, value);