import type { AppSettings, Language } from "../types";
import { Chip, Page, SectionTitle, Toggle } from "../components/ui";

type SettingsScreenProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  settings: AppSettings;
  onUpdate: (next: AppSettings) => void;
  onBack: () => void;
};

export const SettingsScreen = ({ t, settings, onUpdate, onBack }: SettingsScreenProps) => {
  const setLanguage = (language: Language) => onUpdate({ ...settings, language });

  return (
    <Page>
      <SectionTitle title={t("settings")} onBack={onBack} />

      <section className="space-y-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-sm text-slate-600">{t("language")}</p>
          <div className="mt-2 flex gap-2">
            <Chip active={settings.language === "en"} onClick={() => setLanguage("en")}>
              {t("english")}
            </Chip>
            <Chip active={settings.language === "mn"} onClick={() => setLanguage("mn")}>
              {t("mongolian")}
            </Chip>
          </div>
        </div>

        <div>
          <p className="text-sm text-slate-600">{t("theme")}</p>
          <div className="mt-2 flex gap-2">
            <Chip active={settings.theme === "light"} onClick={() => onUpdate({ ...settings, theme: "light" })}>
              {t("light")}
            </Chip>
            <Chip active={settings.theme === "dark"} onClick={() => onUpdate({ ...settings, theme: "dark" })}>
              {t("dark")}
            </Chip>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700">{t("sound")}</span>
          <Toggle checked={settings.soundEnabled} onChange={(next) => onUpdate({ ...settings, soundEnabled: next })} />
        </div>
      </section>
    </Page>
  );
};