import { Button, InlineMessage, Input, Page, SectionTitle } from "../components/ui";

type PlayersScreenProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  players: string[];
  error: string | null;
  onChangePlayer: (index: number, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onBack: () => void;
  onContinue: () => void;
};

export const PlayersScreen = ({
  t,
  players,
  error,
  onChangePlayer,
  onAddPlayer,
  onRemovePlayer,
  onBack,
  onContinue,
}: PlayersScreenProps) => (
  <Page>
    <SectionTitle title={t("players")} onBack={onBack} />

    <div className="space-y-3">
      {players.map((player, index) => (
        <div key={`${index.toString()}-${player}`} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
          <label className="mb-2 block text-sm text-slate-600">
            {t("player")} {index + 1}
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={player}
              onChange={(value) => onChangePlayer(index, value)}
              placeholder={t("playerNamePlaceholder")}
            />
            {players.length > 3 ? (
              <button
                onClick={() => onRemovePlayer(index)}
                className="h-12 rounded-xl px-3 text-sm text-red-600 ring-1 ring-red-200"
                aria-label={t("removePlayer")}
              >
                {t("delete")}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>

    <button onClick={onAddPlayer} className="mt-4 h-11 rounded-xl bg-white text-sm font-medium text-slate-700 ring-1 ring-slate-200">
      {t("addPlayer")}
    </button>

    <InlineMessage message={error} />

    <div className="mt-auto space-y-2 pt-6">
      <Button onClick={onContinue}>{t("continue")}</Button>
    </div>
  </Page>
);