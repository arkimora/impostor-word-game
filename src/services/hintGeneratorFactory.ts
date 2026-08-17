import type { AppSettings } from "../types";
import type { HintGenerator } from "./hintGenerator";
import { LocalHintGenerator } from "./localHintGenerator";
import { OnlineHintGenerator } from "./onlineHintGenerator";

export const getHintGenerator = (settings: AppSettings): HintGenerator => {
  if (settings.hintMode === "online") {
    return new OnlineHintGenerator({ apiKey: settings.onlineApiKey });
  }
  return new LocalHintGenerator();
};