import { useEffect, useMemo, useRef, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { defaultWords } from "./data/defaultWords";
import {
  createRound,
  expireRoundTimer,
  hideRevealForCurrentPlayer,
  hideRevealAndAdvance,
  restoreRoundSafely,
  setVotes,
  showRevealForCurrentPlayer,
  submitVotes,
} from "./game/gameEngine";
import { shuffle } from "./game/randomizer";
import { getEnabledWords } from "./game/wordManager";
import { translate } from "./localization";
import { Button } from "./components/ui";
import { HomeScreen } from "./screens/HomeScreen";
import { PassingScreen } from "./screens/PassingScreen";
import { PlayersScreen } from "./screens/PlayersScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { RoundSettingsScreen } from "./screens/RoundSettingsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { VotingScreen } from "./screens/VotingScreen";
import { WordManagerScreen, emptyWordDraft, type WordEditorDraft } from "./screens/WordManagerScreen";
import { WordSelectionScreen } from "./screens/WordSelectionScreen";
import {
  defaultSettings,
  loadActiveRound,
  loadRecentWords,
  loadRoundPreferences,
  loadSettings,
  loadWords,
  resetWordsToDefault,
  saveActiveRound,
  saveRecentWords,
  saveRoundPreferences,
  saveSettings,
  saveWords,
} from "./storage/storage";
import type { AppSettings, GameWord, Language, Player, RoundState, Screen } from "./types";

const toPlayers = (names: string[]): Player[] =>
  names.map((name, index) => ({
    id: `p-${index + 1}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
  }));

const parseCommaList = (value: string): string[] => value.split(",").map((item) => item.trim()).filter(Boolean);

const getRecommendedImpostorCount = (playerCount: number): number => {
  if (playerCount >= 11) {
    return 3;
  }
  if (playerCount >= 5) {
    return 2;
  }
  return 1;
};

const useGameSounds = (enabled: boolean) => {
  const withContext = (fn: (ctx: AudioContext) => void) => {
    if (!enabled) {
      return;
    }
    const ctx = new window.AudioContext();
    fn(ctx);
    window.setTimeout(() => void ctx.close(), 1400);
  };

  const playTone = (ctx: AudioContext, frequency: number, duration: number, type: OscillatorType, gainValue = 0.022) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playWhoosh = (ctx: AudioContext, startFreq: number, endFreq: number, duration: number, gainPeak = 0.03) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(startFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playDing = (ctx: AudioContext, base: number, delay = 0) => {
    window.setTimeout(() => {
      playTone(ctx, base, 0.26, "sine", 0.017);
      window.setTimeout(() => playTone(ctx, base * 1.22, 0.3, "sine", 0.015), 80);
    }, delay);
  };

  return {
    input: () => withContext((ctx) => playTone(ctx, 300, 0.2, "sine", 0.009)),
    click: () => withContext((ctx) => playTone(ctx, 430, 0.25, "triangle", 0.015)),
    tap: () => withContext((ctx) => playTone(ctx, 360, 0.28, "sine", 0.013)),
    woosh: () => withContext((ctx) => playWhoosh(ctx, 950, 180, 0.58, 0.02)),
    slide: () => withContext((ctx) => playWhoosh(ctx, 680, 210, 0.5, 0.016)),
    bloom: () => withContext((ctx) => playDing(ctx, 420)),
    tick: () => withContext((ctx) => playTone(ctx, 280, 0.2, "sine", 0.008)),
    warning: () => withContext((ctx) => {
      playTone(ctx, 340, 0.28, "triangle", 0.01);
      window.setTimeout(() => playTone(ctx, 410, 0.3, "triangle", 0.011), 170);
    }),
    error: () => withContext((ctx) => {
      playTone(ctx, 230, 0.35, "sine", 0.012);
      window.setTimeout(() => playTone(ctx, 170, 0.45, "sine", 0.013), 160);
    }),
    lose: () => withContext((ctx) => {
      playWhoosh(ctx, 340, 100, 0.75, 0.013);
    }),
    timeout: () => withContext((ctx) => {
      playTone(ctx, 260, 0.38, "triangle", 0.012);
      window.setTimeout(() => playTone(ctx, 210, 0.45, "triangle", 0.012), 220);
    }),
    celebrate: () =>
      withContext((ctx) => {
        playDing(ctx, 520);
        playDing(ctx, 620, 180);
        playDing(ctx, 760, 360);
      }),
  };
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [players, setPlayers] = useState<string[]>(["Alex", "Sarah", "Bat"]);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [roundError, setRoundError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [words, setWords] = useState<GameWord[]>(defaultWords);
  const [wordSearch, setWordSearch] = useState("");
  const [wordFilter, setWordFilter] = useState<"all" | Language>("all");
  const [wordDraft, setWordDraft] = useState<WordEditorDraft>(emptyWordDraft);
  const [wordError, setWordError] = useState<string | null>(null);
  const [recentWordIds, setRecentWordIds] = useState<string[]>([]);
  const [roundLanguageFilter, setRoundLanguageFilter] = useState<"all" | Language>("all");
  const [activeRound, setActiveRound] = useState<RoundState | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [customVotingDuration, setCustomVotingDuration] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const lastVotingSecondRef = useRef<number | null>(null);
  const lastResultRoundIdRef = useRef<string | null>(null);

  const t = (key: string, vars?: Record<string, string | number>) => translate(settings.language, key, vars);
  const sounds = useGameSounds(settings.soundEnabled);

  const navigateTo = (next: Screen) => {
    setScreen((current) => {
      if (current !== next) {
        setScreenHistory((history) => [...history, current]);
      }
      return next;
    });
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const previous = screenHistory[screenHistory.length - 1];
      sounds.slide();
      setScreen(previous);
      setScreenHistory((history) => history.slice(0, -1));
      return;
    }

    if (screen !== "home") {
      sounds.slide();
      setScreen("home");
      setScreenHistory([]);
    }
  };

  useEffect(() => {
    const settingsResult = loadSettings();
    const wordsResult = loadWords();
    const recentWordsResult = loadRecentWords();
    const preferencesResult = loadRoundPreferences();
    const roundResult = loadActiveRound();

    setSettings(settingsResult.value);
    setWords(wordsResult.value);
    setRecentWordIds(recentWordsResult.value);
    setPlayers(preferencesResult.value.players);
    setRoundLanguageFilter(preferencesResult.value.languageFilter);

    if (!settingsResult.ok || !wordsResult.ok || !recentWordsResult.ok || !preferencesResult.ok || !roundResult.ok) {
      setStorageError(true);
    }

    if (roundResult.value) {
      const safeRound = restoreRoundSafely(roundResult.value);
      setActiveRound(safeRound);
      setScreen(safeRound.phase === "results" ? "results" : safeRound.phase === "voting" ? "voting" : "passing");
      setScreenHistory([]);
      setToast(t("roundRecovered"));
    }
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.body.classList.toggle("theme-dark", settings.theme === "dark");
  }, [settings.language, settings.theme]);

  useEffect(() => {
    saveWords(words);
  }, [words]);

  useEffect(() => {
    saveRecentWords(recentWordIds);
  }, [recentWordIds]);

  useEffect(() => {
    saveRoundPreferences({ players, languageFilter: roundLanguageFilter });
  }, [players, roundLanguageFilter]);

  useEffect(() => {
    saveActiveRound(activeRound);
  }, [activeRound]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    // Safety net: never render an empty game screen when no round exists.
    if (!activeRound && (screen === "passing" || screen === "voting" || screen === "results")) {
      setToast(t("safeReset"));
      setScreen("home");
      setScreenHistory([]);
    }
  }, [screen, activeRound, settings.language]);

  useEffect(() => {
    const listener = CapacitorApp.addListener("backButton", () => {
      if (screen !== "home" || screenHistory.length > 0) {
        goBack();
      }
    });

    return () => {
      listener.then((handle) => handle.remove()).catch(() => {
        // Ignore cleanup errors on non-native builds.
      });
    };
  }, [screen, screenHistory.length, activeRound, settings.language]);

  useEffect(() => {
    if (!activeRound || !["passing", "revealing", "voting"].includes(activeRound.phase)) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = t("leaveWarning");
    };

    const onPopState = () => {
      history.pushState({ lock: true }, "");
      setToast(t("backBlocked"));
    };

    history.pushState({ lock: true }, "");
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
    };
  }, [activeRound, settings.language]);

  useEffect(() => {
    if (!activeRound || activeRound.phase !== "voting" || !activeRound.votingEndsAt) {
      return;
    }

    const tick = () => {
      const left = activeRound.votingEndsAt ? activeRound.votingEndsAt - Date.now() : 0;
      setRemainingMs(Math.max(0, left));
      if (left <= 0) {
        setActiveRound((prev) => (prev ? expireRoundTimer(prev) : prev));
        sounds.timeout();
        navigateTo("results");
      }
    };

    tick();
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [activeRound]);

  useEffect(() => {
    if (!activeRound || activeRound.phase !== "results") {
      return;
    }
    if (lastResultRoundIdRef.current === activeRound.id) {
      return;
    }
    lastResultRoundIdRef.current = activeRound.id;
    if (activeRound.winner === "innocents") {
      sounds.celebrate();
    } else if (activeRound.timedOut) {
      sounds.timeout();
    } else {
      sounds.lose();
    }
  }, [activeRound?.phase]);

  useEffect(() => {
    if (!activeRound || activeRound.phase !== "voting") {
      lastVotingSecondRef.current = null;
      return;
    }
    const seconds = Math.ceil(remainingMs / 1000);
    if (seconds <= 0) {
      return;
    }
    if (lastVotingSecondRef.current === seconds) {
      return;
    }
    lastVotingSecondRef.current = seconds;
    if (seconds <= 10) {
      sounds.warning();
    } else {
      sounds.tick();
    }
  }, [remainingMs, activeRound?.phase]);

  const filteredWords = useMemo(() => {
    const byLanguage = words.filter((word) => wordFilter === "all" || word.language === wordFilter);
    const normalizedSearch = wordSearch.trim().toLowerCase();
    return byLanguage.filter((word) => word.word.toLowerCase().includes(normalizedSearch));
  }, [wordFilter, wordSearch, words]);

  const enabledRoundWords = useMemo(() => getEnabledWords(words, roundLanguageFilter), [words, roundLanguageFilter]);

  const validatePlayers = (value: string[]): string | null => {
    const normalized = value.map((name) => name.trim());
    if (normalized.length < 3) {
      return t("playersMinError");
    }
    if (normalized.some((name) => !name)) {
      return t("playersEmptyError");
    }
    const unique = new Set(normalized.map((name) => name.toLowerCase()));
    if (unique.size !== normalized.length) {
      return t("playersDuplicateError");
    }
    return null;
  };

  const startRound = async () => {
    const validationError = validatePlayers(players);
    if (validationError) {
      setRoundError(validationError);
      sounds.error();
      navigateTo("players");
      return;
    }

    const roundResult = await createRound({
      players: toPlayers(players),
      words,
      settings,
      recentWordIds,
      languageFilter: roundLanguageFilter,
    });

    if (!roundResult.ok) {
      const key =
        roundResult.error === "not_enough_players"
          ? "playersMinError"
          : roundResult.error === "invalid_impostor_count"
            ? "invalidImpostorCount"
            : "noWords";
      setRoundError(t(key));
      sounds.error();
      return;
    }

    sounds.woosh();
    setRecentWordIds(roundResult.nextRecentWordIds);
    setActiveRound(roundResult.round);
    navigateTo("passing");
    setRoundError(null);
  };

  const handleSubmitPlayers = () => {
    sounds.bloom();
    const validationError = validatePlayers(players);
    if (validationError) {
      setPlayerError(validationError);
      sounds.error();
      return;
    }
    setPlayerError(null);
    setSettings((prev) => ({
      ...prev,
      impostorCount: Math.min(Math.max(1, getRecommendedImpostorCount(players.length)), players.length - 1),
    }));
    navigateTo("roundSettings");
  };

  const updateWordDraft = (next: WordEditorDraft) => {
    sounds.input();
    setWordError(null);
    setWordDraft(next);
  };

  const saveWordDraft = () => {
    const normalized = wordDraft.word.trim();
    if (!normalized) {
      setWordError(t("wordRequired"));
      sounds.error();
      return;
    }

    const duplicate = words.some(
      (word) =>
        word.id !== wordDraft.id &&
        word.language === wordDraft.language &&
        word.word.trim().toLowerCase() === normalized.toLowerCase()
    );
    if (duplicate) {
      setWordError(t("wordDuplicate"));
      sounds.error();
      return;
    }

    const hints = parseCommaList(wordDraft.hints);
    if (!hints.length) {
      setWordError(t("hintRequired"));
      sounds.error();
      return;
    }

    if (wordDraft.id) {
      setWords((prev) =>
        prev.map((word) =>
          word.id === wordDraft.id
            ? {
                ...word,
                word: normalized,
                language: wordDraft.language,
                category: wordDraft.category.trim() || "everyday",
                relatedConcepts: hints,
                contexts: hints,
              }
            : word
        )
      );
    } else {
      setWords((prev) => [
        {
          id: `custom-${Date.now()}`,
          word: normalized,
          language: wordDraft.language,
          category: wordDraft.category.trim() || "everyday",
          relatedConcepts: hints,
          contexts: hints,
          enabled: true,
          builtIn: false,
        },
        ...prev,
      ]);
    }

    setWordDraft(emptyWordDraft);
    setWordError(null);
    sounds.bloom();
  };

  const updateRoundFromReveal = (action: "reveal" | "hide" | "pass") => {
    if (!activeRound) {
      return;
    }
    const next =
      action === "reveal"
        ? showRevealForCurrentPlayer(activeRound)
        : action === "hide"
          ? hideRevealForCurrentPlayer(activeRound)
          : hideRevealAndAdvance(activeRound);
    if (action === "reveal") {
      sounds.slide();
    }
    if (action === "hide") {
      sounds.click();
    }
    if (action === "pass") {
      sounds.woosh();
    }
    setActiveRound(next);
    if (next.phase === "voting") {
      navigateTo("voting");
    }
  };

  const toggleVote = (playerId: string) => {
    if (!activeRound || activeRound.phase !== "voting") {
      return;
    }

    const exists = activeRound.selectedVotes.includes(playerId);
    const nextVotes = exists
      ? activeRound.selectedVotes.filter((id) => id !== playerId)
      : activeRound.selectedVotes.length < activeRound.impostorIds.length
        ? [...activeRound.selectedVotes, playerId]
        : activeRound.selectedVotes;
    sounds.tap();
    setActiveRound(setVotes(activeRound, nextVotes));
  };

  const onSubmitVote = () => {
    if (!activeRound || activeRound.phase !== "voting") {
      return;
    }
    if (activeRound.selectedVotes.length !== activeRound.impostorIds.length) {
      setVoteError(t("cannotVoteYet"));
      sounds.error();
      return;
    }
    if (activeRound.votingEndsAt && Date.now() >= activeRound.votingEndsAt) {
      const expired = expireRoundTimer(activeRound);
      setActiveRound(expired);
      sounds.woosh();
      navigateTo("results");
      return;
    }
    sounds.click();
    setVoteError(null);
    setActiveRound(submitVotes(activeRound));
    navigateTo("results");
  };

  const goHome = () => {
    sounds.woosh();
    setActiveRound(null);
    setScreen("home");
    setScreenHistory([]);
    setRoundError(null);
    setVoteError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {storageError ? (
        <div className="px-4 pt-3 text-center text-xs text-red-700">{t("storageError")}</div>
      ) : null}
      {toast ? <div className="px-4 pt-3 text-center text-xs text-slate-500">{toast}</div> : null}

      {screen === "home" ? (
        <HomeScreen
          t={t}
          onNewRound={() => {
            sounds.click();
            navigateTo("players");
          }}
          onWordList={() => {
            sounds.tap();
            navigateTo("wordManager");
          }}
          onSettings={() => {
            sounds.tap();
            navigateTo("appSettings");
          }}
          onLanguage={() =>
            {
              sounds.tap();
              setSettings((prev) => ({
                ...prev,
                language: prev.language === "en" ? "mn" : "en",
              }));
            }
          }
        />
      ) : null}

      {screen === "players" ? (
        <PlayersScreen
          t={t}
          players={players}
          error={playerError}
          onChangePlayer={(index, value) => {
            sounds.input();
            setPlayers((prev) => prev.map((name, i) => (i === index ? value : name)));
            setPlayerError(null);
          }}
          onAddPlayer={() => {
            sounds.tap();
            setPlayers((prev) => [...prev, ""]);
          }}
          onRemovePlayer={(index) => {
            sounds.tap();
            setPlayers((prev) => prev.filter((_, i) => i !== index));
          }}
          onBack={goBack}
          onContinue={handleSubmitPlayers}
        />
      ) : null}

      {screen === "roundSettings" ? (
        <RoundSettingsScreen
          t={t}
          impostorCount={settings.impostorCount}
          onImpostorCountChange={(next) => {
            sounds.tap();
            setSettings((prev) => ({ ...prev, impostorCount: next }));
          }}
          votingDuration={settings.votingDuration}
          customVotingDuration={customVotingDuration}
          onVotingDurationPreset={(seconds) => {
            sounds.tap();
            setSettings((prev) => ({ ...prev, votingDuration: seconds }));
            setCustomVotingDuration("");
          }}
          onCustomVotingDuration={(value) => {
            sounds.input();
            setCustomVotingDuration(value);
            const parsed = Number.parseInt(value, 10);
            if (!Number.isNaN(parsed) && parsed >= 15 && parsed <= 600) {
              setSettings((prev) => ({ ...prev, votingDuration: parsed }));
            }
          }}
          maxImpostors={Math.max(1, players.length - 1)}
          error={roundError}
          onBack={goBack}
          onContinue={() => {
            const custom = customVotingDuration.trim();
            if (custom) {
              const parsed = Number.parseInt(custom, 10);
              if (Number.isNaN(parsed) || parsed < 15 || parsed > 600) {
                setRoundError(t("invalidCustomVoteTime"));
                sounds.error();
                return;
              }
              setSettings((prev) => ({ ...prev, votingDuration: parsed }));
            }
            if (settings.impostorCount >= players.length) {
              setRoundError(t("invalidImpostorCount"));
              sounds.error();
              return;
            }
            setRoundError(null);
            sounds.tap();
            navigateTo("wordSelection");
          }}
        />
      ) : null}

      {screen === "wordSelection" ? (
        <WordSelectionScreen
          t={t}
          languageFilter={roundLanguageFilter}
          enabledCount={enabledRoundWords.length}
          error={roundError}
          onChangeFilter={(value) => {
            sounds.tap();
            setRoundLanguageFilter(value);
          }}
          onStartGame={startRound}
          onBack={goBack}
          onManageWords={() => {
            sounds.tap();
            navigateTo("wordManager");
          }}
        />
      ) : null}

      {screen === "passing" && activeRound ? (
        <PassingScreen
          t={t}
          round={activeRound}
          isDark={settings.theme === "dark"}
          onRevealStart={() => updateRoundFromReveal("reveal")}
          onRevealEnd={() => updateRoundFromReveal("hide")}
          onHideAndPass={() => updateRoundFromReveal("pass")}
        />
      ) : null}

      {screen === "voting" && activeRound ? (
        <VotingScreen
          t={t}
          round={activeRound}
          selectedVotes={activeRound.selectedVotes}
          remainingMs={remainingMs}
          error={voteError}
          onToggleVote={toggleVote}
          onSubmitVote={onSubmitVote}
        />
      ) : null}

      {screen === "results" && activeRound ? (
        <ResultsScreen
          t={t}
          round={activeRound}
          onPlayAgain={(shufflePlayersFlag) => {
            const nextPlayers = shufflePlayersFlag ? shuffle(players) : players;
            setPlayers(nextPlayers);
            setActiveRound(null);
            setRoundError(null);
            setVoteError(null);
            sounds.tap();
            navigateTo("wordSelection");
          }}
          onHome={goHome}
        />
      ) : null}

      {screen === "wordManager" ? (
        <WordManagerScreen
          t={t}
          words={filteredWords}
          search={wordSearch}
          filter={wordFilter}
          draft={wordDraft}
          error={wordError}
          onSearch={(value) => {
            sounds.input();
            setWordSearch(value);
          }}
          onFilter={(value) => {
            sounds.tap();
            setWordFilter(value);
          }}
          onDraftChange={updateWordDraft}
          onSaveDraft={saveWordDraft}
          onEditWord={(word) =>
            setWordDraft({
              id: word.id,
              word: word.word,
              language: word.language,
              category: word.category,
              hints: word.relatedConcepts.join(", "),
            })
          }
          onDeleteWord={(id) => {
            setWords((prev) => prev.filter((word) => word.id !== id));
            if (wordDraft.id === id) {
              setWordDraft(emptyWordDraft);
            }
            sounds.tap();
          }}
          onToggleWordEnabled={(id, enabled) => {
            sounds.tap();
            setWords((prev) => prev.map((word) => (word.id === id ? { ...word, enabled } : word)));
          }}
          onResetDefaults={() => {
            if (window.confirm(t("resetWordsConfirm"))) {
              sounds.woosh();
              resetWordsToDefault();
              setWords(defaultWords);
              setWordDraft(emptyWordDraft);
            }
          }}
          onBack={goBack}
        />
      ) : null}

      {screen === "appSettings" ? (
        <SettingsScreen
          t={t}
          settings={settings}
          onUpdate={(next) => {
            sounds.click();
            setSettings(next);
          }}
          onBack={goBack}
        />
      ) : null}

      {screen === "passing" && !activeRound ? (
        <div className="mx-auto max-w-md p-5">
          <Button onClick={goHome}>{t("home")}</Button>
        </div>
      ) : null}
    </div>
  );
}
