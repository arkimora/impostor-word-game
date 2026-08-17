import type { RoundWinner } from "../types";

export const determineWinner = (
  actualImpostorIds: string[],
  votedIds: string[],
  timedOut: boolean
): RoundWinner => {
  if (timedOut) {
    return "impostors";
  }

  const actual = [...actualImpostorIds].sort().join("|");
  const voted = [...votedIds].sort().join("|");
  return actual === voted ? "innocents" : "impostors";
};