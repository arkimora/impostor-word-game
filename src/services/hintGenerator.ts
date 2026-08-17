import type { GameWord } from "../types";

export interface HintGenerator {
  generateHint(word: GameWord): Promise<string>;
}