import { Button, Chip, InlineMessage, Input, Page, SectionTitle } from "../components/ui";

type RoundSettingsScreenProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  impostorCount: number;
  onImpostorCountChange: (next: number) => void;
  votingDuration: number;
  customVotingDuration: string;
  onVotingDurationPreset: (seconds: number) => void;
  onCustomVotingDuration: (value: string) => void;
  maxImpostors: number;
  error: string | null;
  onBack: () => void;
  onContinue: () => void;
};

const presets = [30, 60, 90, 120, 180, 300];

export const RoundSettingsScreen = ({
  t,
  impostorCount,
  onImpostorCountChange,
  votingDuration,
  customVotingDuration,
  onVotingDurationPreset,
  onCustomVotingDuration,
  maxImpostors,
  error,
  onBack,
  onContinue,
}: RoundSettingsScreenProps) => (
  <Page>
    <SectionTitle title={t("roundSettings")} onBack={onBack} />

    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-600">{t("impostors")}</p>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => onImpostorCountChange(Math.max(1, impostorCount - 1))}
          className="h-11 w-11 rounded-xl bg-slate-100 text-xl"
        >
          -
        </button>
        <div className="text-3xl font-semibold">{impostorCount}</div>
        <button
          onClick={() => onImpostorCountChange(Math.min(maxImpostors, impostorCount + 1))}
          className="h-11 w-11 rounded-xl bg-slate-100 text-xl"
        >
          +
        </button>
      </div>
    </section>

    <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-600">{t("votingTime")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Chip key={preset} active={votingDuration === preset} onClick={() => onVotingDurationPreset(preset)}>
            {preset >= 60 ? `${preset / 60} ${t("minutes")}` : `${preset} ${t("seconds")}`}
          </Chip>
        ))}
      </div>
      <div className="mt-3">
        <label className="mb-2 block text-sm text-slate-600">{t("custom")}</label>
        <Input value={customVotingDuration} onChange={onCustomVotingDuration} placeholder="75" />
      </div>
    </section>

    <InlineMessage message={error} />

    <div className="mt-auto space-y-2 pt-6">
      <Button onClick={onContinue}>{t("continue")}</Button>
    </div>
  </Page>
);