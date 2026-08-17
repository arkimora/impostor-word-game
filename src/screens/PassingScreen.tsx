import type { RoundState } from "../types";
import { Button, Page } from "../components/ui";
import { cn } from "../utils/cn";

type PassingScreenProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  round: RoundState;
  isDark: boolean;
  onRevealStart: () => void;
  onRevealEnd: () => void;
  onHideAndPass: () => void;
};

export const PassingScreen = ({ t, round, isDark, onRevealStart, onRevealEnd, onHideAndPass }: PassingScreenProps) => {
  const currentPlayer = round.players[round.currentPlayerIndex];
  const role = round.roles[currentPlayer.id];

  return (
    <Page className={cn(isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900")}>
      <section className="flex flex-1 flex-col justify-center text-center">
        <p className={cn("text-sm uppercase tracking-[0.2em]", isDark ? "text-slate-400" : "text-slate-500")}>{t("getReady")}</p>
        <p className={cn("mt-4 text-base", isDark ? "text-slate-300" : "text-slate-600")}>{t("passPhoneTo")}</p>
        <h1 className="mt-2 text-4xl font-semibold">{currentPlayer.name}</h1>
        <p className={cn("mx-auto mt-6 max-w-xs text-sm", isDark ? "text-slate-400" : "text-slate-600")}>{t("onlyForYou")}</p>

        <div
          className={cn(
            "reveal-sheet mt-8 rounded-3xl border p-4",
            isDark ? "border-slate-700 bg-slate-900" : "border-slate-300 bg-white"
          )}
        >
          <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-600")}>{t("holdToReveal")}</p>
          <p className={cn("mt-1 text-xs", isDark ? "text-slate-500" : "text-slate-500")}>{t("releaseToHide")}</p>

          <div
            className={cn(
              "reveal-card mt-4 min-h-36 rounded-2xl border p-4 transition-transform duration-150",
              isDark ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-slate-50",
              round.isRevealVisible ? "-translate-y-8" : "translate-y-0"
            )}
            onMouseDown={onRevealStart}
            onMouseUp={onRevealEnd}
            onMouseLeave={onRevealEnd}
            onTouchStart={onRevealStart}
            onTouchEnd={onRevealEnd}
            onTouchCancel={onRevealEnd}
          >
            {round.isRevealVisible ? (
              <>
                <h2 className={cn("text-sm uppercase tracking-[0.2em]", isDark ? "text-slate-400" : "text-slate-500")}>{currentPlayer.name}</h2>
                <h1 className="mt-2 text-xl font-semibold">{role === "impostor" ? t("youAreImpostor") : t("youAreInnocent")}</h1>
                <p className={cn("mt-3 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{role === "impostor" ? t("yourHintIs") : t("secretWordIs")}</p>
                <p className="mt-1 text-2xl font-semibold">{role === "impostor" ? round.hint : round.word.word}</p>
              </>
            ) : (
              <div className={cn("flex min-h-28 items-center justify-center", isDark ? "text-slate-400" : "text-slate-600")}>{t("revealMyRole")}</div>
            )}
          </div>
        </div>

        <Button
          variant={isDark ? "secondary" : "primary"}
          className="mt-6"
          disabled={!round.hasSeenCurrentRole}
          onClick={onHideAndPass}
        >
          {t("passAfterReveal")}
        </Button>
      </section>
    </Page>
  );
};