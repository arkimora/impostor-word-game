import type { Language } from "../types";
import { Button, Chip, InlineMessage, Page, SectionTitle } from "../components/ui";

type WordSelectionScreenProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  languageFilter: "all" | Language;
  enabledCount: number;
  error: string | null;
  onChangeFilter: (next: "all" | Language) => void;
  onStartGame: () => void;
  onBack: () => void;
  onManageWords: () => void;
};

export const WordSelectionScreen = ({
  t,
  languageFilter,
  enabledCount,
  error,
  onChangeFilter,
  onStartGame,
  onBack,
  onManageWords,
}: WordSelectionScreenProps) => (
  <Page>
    <SectionTitle title={t("wordSelection")} subtitle={t("useWordsHint")} onBack={onBack} />

    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-600">{t("wordLanguageFilter")}</p>
      <div className="mt-3 flex gap-2">
        <Chip active={languageFilter === "all"} onClick={() => onChangeFilter("all")}>
          {t("all")}
        </Chip>
        <Chip active={languageFilter === "en"} onClick={() => onChangeFilter("en")}>
          {t("english")}
        </Chip>
        <Chip active={languageFilter === "mn"} onClick={() => onChangeFilter("mn")}>
          {t("mongolian")}
        </Chip>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        {t("enabledWords")}: <strong className="text-slate-900">{enabledCount}</strong>
      </p>
    </section>

    <Button variant="secondary" className="mt-4" onClick={onManageWords}>
      {t("manageWords")}
    </Button>

    <InlineMessage message={error} />

    <div className="mt-auto space-y-2 pt-6">
      <Button disabled={enabledCount === 0} onClick={onStartGame}>
        {t("startGame")}
      </Button>
    </div>
  </Page>
);