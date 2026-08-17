import type { AppSettings, GameRole, GameWord, Player, RoundState } from "../types";
import { determineWinner } from "./gameRules";
import { sampleUnique } from "./randomizer";
import { addWordToRecentHistory, pickWordWithHistory } from "./wordManager";

type CreateRoundInput = {
  players: Player[];
  words: GameWord[];
  settings: AppSettings;
  recentWordIds: string[];
  languageFilter: "all" | "en" | "mn";
};

export type CreateRoundResult =
  | {
      ok: true;
      round: RoundState;
      nextRecentWordIds: string[];
    }
  | {
      ok: false;
      error: "not_enough_players" | "invalid_impostor_count" | "no_words";
    };

const createPlayerRoleMap = (players: Player[], impostorIds: string[]): Record<string, GameRole> => {
  const impostorSet = new Set(impostorIds);
  return players.reduce<Record<string, GameRole>>((acc, player) => {
    acc[player.id] = impostorSet.has(player.id) ? "impostor" : "innocent";
    return acc;
  }, {});
};

const getOneWordHint = (word: GameWord): string => {
  const fromRelated = word.relatedConcepts.find((entry) => entry.trim().length > 0);
  if (fromRelated) {
    return fromRelated.trim().split(/\s+/)[0];
  }
  const fromContext = word.contexts.find((entry) => entry.trim().length > 0);
  if (fromContext) {
    return fromContext.trim().split(/\s+/)[0];
  }
  return word.language === "mn" ? "ойр" : "near";
};

export const createRound = async ({
  players,
  words,
  settings,
  recentWordIds,
  languageFilter,
}: CreateRoundInput): Promise<CreateRoundResult> => {
  if (players.length < 3) {
    return { ok: false, error: "not_enough_players" };
  }

  if (settings.impostorCount >= players.length) {
    return { ok: false, error: "invalid_impostor_count" };
  }

  const selectedWord = pickWordWithHistory(words, recentWordIds, languageFilter);
  if (!selectedWord) {
    return { ok: false, error: "no_words" };
  }

  const impostorIds = sampleUnique(
    players.map((player) => player.id),
    settings.impostorCount
  );

  const hint = getOneWordHint(selectedWord);

  const round: RoundState = {
    id: `round-${Date.now()}`,
    phase: "passing",
    players,
    roles: createPlayerRoleMap(players, impostorIds),
    impostorIds,
    currentPlayerIndex: 0,
    word: {
      id: selectedWord.id,
      word: selectedWord.word,
      language: selectedWord.language,
      category: selectedWord.category,
    },
    hint,
    isRevealVisible: false,
    hasSeenCurrentRole: false,
    selectedVotes: [],
    votingEndsAt: null,
    votingDuration: settings.votingDuration,
    winner: null,
    timedOut: false,
    createdAt: Date.now(),
  };

  return {
    ok: true,
    round,
    nextRecentWordIds: addWordToRecentHistory(recentWordIds, selectedWord.id),
  };
};

export const showRevealForCurrentPlayer = (round: RoundState): RoundState => ({
  ...round,
  phase: "revealing",
  isRevealVisible: true,
  hasSeenCurrentRole: true,
});

export const hideRevealForCurrentPlayer = (round: RoundState): RoundState => ({
  ...round,
  phase: "passing",
  isRevealVisible: false,
});

export const hideRevealAndAdvance = (round: RoundState): RoundState => {
  const nextIndex = round.currentPlayerIndex + 1;
  if (nextIndex >= round.players.length) {
    return {
      ...round,
      phase: "voting",
      isRevealVisible: false,
      hasSeenCurrentRole: false,
      currentPlayerIndex: round.players.length - 1,
      votingEndsAt: Date.now() + round.votingDuration * 1000,
    };
  }

  return {
    ...round,
    phase: "passing",
    isRevealVisible: false,
    hasSeenCurrentRole: false,
    currentPlayerIndex: nextIndex,
  };
};

export const setVotes = (round: RoundState, playerIds: string[]): RoundState => ({
  ...round,
  selectedVotes: playerIds,
});

export const submitVotes = (round: RoundState): RoundState => {
  const winner = determineWinner(round.impostorIds, round.selectedVotes, false);
  return {
    ...round,
    phase: "results",
    winner,
    timedOut: false,
  };
};

export const expireRoundTimer = (round: RoundState): RoundState => ({
  ...round,
  phase: "results",
  timedOut: true,
  winner: determineWinner(round.impostorIds, round.selectedVotes, true),
});

export const restoreRoundSafely = (round: RoundState): RoundState => {
  if (round.phase === "revealing") {
    return {
      ...round,
      phase: "passing",
      isRevealVisible: false,
      hasSeenCurrentRole: false,
    };
  }
  if (round.phase === "passing") {
    return {
      ...round,
      isRevealVisible: false,
      hasSeenCurrentRole: false,
    };
  }
  return round;
};