import type { GameWord } from "../types";
import type { HintGenerator } from "./hintGenerator";
import { LocalHintGenerator } from "./localHintGenerator";

type OnlineHintConfig = {
  apiKey: string;
};

export class OnlineHintGenerator implements HintGenerator {
  private localFallback = new LocalHintGenerator();

  constructor(private readonly config: OnlineHintConfig) {}

  async generateHint(word: GameWord): Promise<string> {
    // Placeholder: integrate your preferred provider here.
    // Keep this fallback so the game is always playable offline.
    if (!this.config.apiKey) {
      return this.localFallback.generateHint(word);
    }
    return this.localFallback.generateHint(word);
  }
}