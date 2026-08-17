import type { RoundState } from "../types";
import { Button, Page, SectionTitle } from "../components/ui";

type ResultsScreenProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  round: RoundState;
  onPlayAgain: (shufflePlayers: boolean) => void;
  onHome: () => void;
};

export const ResultsScreen = ({ t, round, onPlayAgain, onHome }: ResultsScreenProps) => {
  const impostorNames = round.players.filter((player) => round.impostorIds.includes(player.id)).map((player) => player.name);
  const innocentNames = round.players.filter((player) => !round.impostorIds.includes(player.id)).map((player) => player.name);
  const votedNames = round.players.filter((player) => round.selectedVotes.includes(player.id)).map((player) => player.name);

  return (
    <Page>
      <SectionTitle title={t("roundOver")} />
      <section className="animate-rise rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        {round.timedOut ? (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {t("timesUp")} {t("impostorWins")}
          </div>
        ) : null}
        <p className="text-sm text-slate-500">{t("actualImpostors")}</p>
        <p className="mt-1 text-lg font-semibold">{impostorNames.join(", ")}</p>

        <p className="mt-4 text-sm text-slate-500">{t("innocents")}</p>
        <p className="mt-1 text-base text-slate-800">{innocentNames.join(", ")}</p>

        <p className="mt-4 text-sm text-slate-500">{t("youVotedFor")}</p>
        <p className="mt-1 text-base text-slate-800">{votedNames.length ? votedNames.join(", ") : "-"}</p>

        <p className="mt-6 text-center text-2xl font-semibold">
          {round.winner === "innocents" ? t("innocentsWin") : t("impostorsWin")}
        </p>
      </section>

      <div className="mt-auto space-y-2 pt-6">
        <Button onClick={() => onPlayAgain(false)}>{t("reusePlayers")}</Button>
        <Button variant="secondary" onClick={() => onPlayAgain(true)}>
          {t("shufflePlayers")}
        </Button>
        <Button variant="ghost" onClick={onHome}>
          {t("home")}
        </Button>
      </div>
    </Page>
  );
};