export type Language = "en" | "mn";

export type ThemeMode = "light" | "dark";

export type GameRole = "innocent" | "impostor";

export type Screen =
  | "home"
  | "players"
  | "roundSettings"
  | "wordSelection"
  | "passing"
  | "voting"
  | "results"
  | "wordManager"
  | "appSettings";

export type Player = {
  id: string;
  name: string;
};

export type GameWord = {
  id: string;
  word: string;
  language: Language;
  category: string;
  relatedConcepts: string[];
  contexts: string[];
  enabled: boolean;
  builtIn: boolean;
};

export type AppSettings = {
  language: Language;
  impostorCount: number;
  votingDuration: number;
  theme: ThemeMode;
  hintMode: "local" | "online";
  soundEnabled: boolean;
  onlineApiKey: string;
};

export type RoundPhase = "passing" | "revealing" | "voting" | "results";

export type RoundWinner = "innocents" | "impostors" | null;

export type RoundState = {
  id: string;
  phase: RoundPhase;
  players: Player[];
  roles: Record<string, GameRole>;
  impostorIds: string[];
  currentPlayerIndex: number;
  word: Pick<GameWord, "id" | "word" | "language" | "category">;
  hint: string;
  isRevealVisible: boolean;
  hasSeenCurrentRole: boolean;
  selectedVotes: string[];
  votingEndsAt: number | null;
  votingDuration: number;
  winner: RoundWinner;
  timedOut: boolean;
  createdAt: number;
};

export type RoundPreferences = {
  players: string[];
  languageFilter: "all" | Language;
};

export type StorageResult<T> = {
  ok: boolean;
  value: T;
  error?: string;
};