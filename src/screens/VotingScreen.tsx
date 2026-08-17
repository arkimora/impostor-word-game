import type { RoundState } from "../types";
import { Button, InlineMessage, Page, SectionTitle } from "../components/ui";
import { cn } from "../utils/cn";

type VotingScreenProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  round: RoundState;
  selectedVotes: string[];
  remainingMs: number;
  error: string | null;
  onToggleVote: (playerId: string) => void;
  onSubmitVote: () => void;
};

const formatClock = (ms: number): string => {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
};

export const VotingScreen = ({
  t,
  round,
  selectedVotes,
  remainingMs,
  error,
  onToggleVote,
  onSubmitVote,
}: VotingScreenProps) => {
  const warning = remainingMs <= 10_000;

  return (
    <Page>
      <SectionTitle title={t("votingTitle")} subtitle={t("whoIsImpostor")} />

      <section className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">{t("timeRemaining")}</p>
        <p className={cn("mt-2 text-5xl font-semibold tracking-tight", warning ? "text-red-600" : "text-slate-900")}>{formatClock(remainingMs)}</p>
        {warning ? <p className="mt-2 text-sm text-red-600">{t("timeWarning")}</p> : null}
      </section>

      <p className="mt-5 text-sm text-slate-600">{t("selectSuspects", { count: round.impostorIds.length })}</p>

      <div className="mt-2 space-y-2">
        {round.players.map((player) => {
          const selected = selectedVotes.includes(player.id);
          return (
            <button
              key={player.id}
              onClick={() => onToggleVote(player.id)}
              className={cn(
                "h-12 w-full rounded-2xl px-4 text-left text-base font-medium transition",
                selected ? "bg-slate-900 text-white" : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
              )}
            >
              {player.name}
            </button>
          );
        })}
      </div>

      <InlineMessage message={error} />

      <div className="mt-auto pt-6">
        <Button onClick={onSubmitVote}>{t("submitVote")}</Button>
      </div>
    </Page>
  );
};