import type { GameWord, Language } from "../types";
import { Button, Chip, Input, Page, SectionTitle, Toggle } from "../components/ui";

type WordEditorDraft = {
  id: string | null;
  word: string;
  language: Language;
  category: string;
  hints: string;
};

type WordManagerScreenProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  words: GameWord[];
  search: string;
  filter: "all" | Language;
  draft: WordEditorDraft;
  error: string | null;
  onSearch: (value: string) => void;
  onFilter: (filter: "all" | Language) => void;
  onDraftChange: (next: WordEditorDraft) => void;
  onSaveDraft: () => void;
  onEditWord: (word: GameWord) => void;
  onDeleteWord: (id: string) => void;
  onToggleWordEnabled: (id: string, enabled: boolean) => void;
  onResetDefaults: () => void;
  onBack: () => void;
};

export const emptyWordDraft: WordEditorDraft = {
  id: null,
  word: "",
  language: "en",
  category: "everyday",
  hints: "",
};

export const WordManagerScreen = ({
  t,
  words,
  search,
  filter,
  draft,
  error,
  onSearch,
  onFilter,
  onDraftChange,
  onSaveDraft,
  onEditWord,
  onDeleteWord,
  onToggleWordEnabled,
  onResetDefaults,
  onBack,
}: WordManagerScreenProps) => (
  <Page>
    <SectionTitle title={t("words")} subtitle={t("wordStats", { count: words.length })} onBack={onBack} />

    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex gap-2">
        <Chip active={filter === "all"} onClick={() => onFilter("all")}>
          {t("all")}
        </Chip>
        <Chip active={filter === "en"} onClick={() => onFilter("en")}>
          {t("english")}
        </Chip>
        <Chip active={filter === "mn"} onClick={() => onFilter("mn")}>
          {t("mongolian")}
        </Chip>
      </div>
      <Input className="mt-3" value={search} onChange={onSearch} placeholder={t("search")} />
    </div>

    <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-600">{draft.id ? t("editWord") : t("addWord")}</p>
      <div className="mt-2 space-y-2">
        <Input value={draft.word} onChange={(value) => onDraftChange({ ...draft, word: value })} placeholder={t("word")} />
        <div className="flex gap-2">
          <Chip active={draft.language === "en"} onClick={() => onDraftChange({ ...draft, language: "en" })}>
            {t("english")}
          </Chip>
          <Chip active={draft.language === "mn"} onClick={() => onDraftChange({ ...draft, language: "mn" })}>
            {t("mongolian")}
          </Chip>
        </div>
        <Input value={draft.category} onChange={(value) => onDraftChange({ ...draft, category: value })} placeholder={t("category")} />
        <Input
          value={draft.hints}
          onChange={(value) => onDraftChange({ ...draft, hints: value })}
          placeholder={t("hints")}
        />
        <Button onClick={onSaveDraft}>{t("save")}</Button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>

    <div className="mt-4 space-y-2">
      {words.map((word) => (
        <div key={word.id} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-base font-medium text-slate-900">{word.word}</p>
              <p className="text-xs text-slate-500">
                {word.language === "en" ? t("english") : t("mongolian")} · {word.builtIn ? t("builtIn") : t("customWord")}
              </p>
            </div>
            <Toggle checked={word.enabled} onChange={(next) => onToggleWordEnabled(word.id, next)} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="h-10" onClick={() => onEditWord(word)}>
              {t("edit")}
            </Button>
            <Button variant="ghost" className="h-10 text-red-600" onClick={() => onDeleteWord(word.id)}>
              {t("delete")}
            </Button>
          </div>
        </div>
      ))}
      {!words.length ? <p className="py-4 text-center text-sm text-slate-500">{t("emptySearch")}</p> : null}
    </div>

    <div className="mt-auto space-y-2 pt-6">
      <Button variant="secondary" onClick={onResetDefaults}>
        {t("resetDefaultWords")}
      </Button>
    </div>
  </Page>
);

export type { WordEditorDraft };