import type { GameWord, Language } from "../types";
import { pickRandom, shuffle } from "../game/randomizer";
import type { HintGenerator } from "./hintGenerator";

const categoryLine: Record<Language, Record<string, string>> = {
  en: {
    food: "something people often enjoy eating or drinking",
    animals: "a living creature people recognize quickly",
    places: "a location people visit for a purpose",
    objects: "an everyday item people handle directly",
    nature: "part of the natural world",
    transportation: "a way people move from one place to another",
    activities: "an action people do for fun, sport, or skill",
    technology: "something tied to devices or modern tools",
    occupations: "work done by trained people",
    everyday: "a common part of daily routines",
  },
  mn: {
    food: "хүмүүсийн өдөр тутмын идэж уудаг зүйл",
    animals: "олон хүнд танил амьтан",
    places: "тодорхой зорилгоор очдог газар",
    objects: "гараар ашигладаг эд зүйл",
    nature: "байгалийн орчны нэг хэсэг",
    transportation: "зорчих хөдөлгөөнтэй холбоотой зүйл",
    activities: "хүмүүсийн хийдэг үйл ажиллагаа",
    technology: "техник, төхөөрөмжтэй холбоотой зүйл",
    occupations: "мэргэжил, ажилтай холбоотой зүйл",
    everyday: "өдөр тутмын амьдралд ойр зүйл",
  },
};

const fallbackHint: Record<Language, string> = {
  en: "Think of something familiar that people talk about often.",
  mn: "Олон хүнд танил, өдөр тутам яригддаг нэг зүйлийг төсөөлөөрэй.",
};

const removeBlank = (value: string | undefined) => (value ?? "").trim();

const generateEnglishHint = (word: GameWord): string => {
  const relation = removeBlank(pickRandom(word.relatedConcepts) ?? "");
  const context = removeBlank(pickRandom(word.contexts) ?? "");
  const categoryHint = categoryLine.en[word.category] ?? "something commonly known";

  const strategies = [
    () => `It belongs to ${categoryHint}.`,
    () => (context ? `People often mention it in situations like ${context}.` : ""),
    () => (relation ? `It is linked to ideas like ${relation}, but that is not the exact answer.` : ""),
    () => `You might encounter this during ordinary conversations, not only in special moments.`,
    () => (context && relation ? `Think of something connected to ${relation} and often seen around ${context}.` : ""),
    () => `It is specific enough to picture, but broad enough that many people know it.`,
  ];

  for (const strategy of shuffle(strategies)) {
    const hint = strategy();
    if (hint.trim().length > 0) {
      return hint;
    }
  }

  return fallbackHint.en;
};

const generateMongolianHint = (word: GameWord): string => {
  const relation = removeBlank(pickRandom(word.relatedConcepts) ?? "");
  const context = removeBlank(pickRandom(word.contexts) ?? "");
  const categoryHint = categoryLine.mn[word.category] ?? "түгээмэл мэддэг зүйл";

  const strategies = [
    () => `Энэ нь ${categoryHint} юм.`,
    () => (context ? `Ийм зүйлийг ${context} орчинд хүмүүс их ярьдаг.` : ""),
    () => (relation ? `${relation} гэх ойлголттой холбоотой ч яг тэр үг биш.` : ""),
    () => "Төсөөлөхөд амархан, гэхдээ шууд хэлэхэд төвөгтэй зүйл.",
    () => (context && relation ? `${context} үед ${relation} санаатай холбож бодоорой.` : ""),
    () => "Өдөр тутмын амьдрал, соёл, ярианд түгээмэл тааралддаг зүйл.",
  ];

  for (const strategy of shuffle(strategies)) {
    const hint = strategy();
    if (hint.trim().length > 0) {
      return hint;
    }
  }

  return fallbackHint.mn;
};

export class LocalHintGenerator implements HintGenerator {
  async generateHint(word: GameWord): Promise<string> {
    return word.language === "mn" ? generateMongolianHint(word) : generateEnglishHint(word);
  }
}