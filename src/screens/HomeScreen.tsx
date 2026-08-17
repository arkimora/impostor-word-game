import { Button, Page, SectionTitle } from "../components/ui";

type HomeScreenProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  onNewRound: () => void;
  onWordList: () => void;
  onSettings: () => void;
  onLanguage: () => void;
};

export const HomeScreen = ({ t, onNewRound, onWordList, onSettings, onLanguage }: HomeScreenProps) => (
  <Page className="justify-between">
    <section className="pt-10">
      <SectionTitle title={t("appName")} subtitle={t("subtitle")} />
    </section>

    <section className="space-y-3">
      <Button onClick={onNewRound}>{t("newRound")}</Button>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onWordList}>
          {t("wordList")}
        </Button>
        <Button variant="secondary" onClick={onSettings}>
          {t("settings")}
        </Button>
      </div>
      <Button variant="ghost" onClick={onLanguage}>
        {t("languageQuickSwitch")}
      </Button>
      <p className="pt-2 text-center text-xs text-slate-500">{t("privacyNotice")}</p>
    </section>
  </Page>
);