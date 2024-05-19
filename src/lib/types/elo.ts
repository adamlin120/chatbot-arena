export type EloRating = {
  modelName: string;
  eloRating: number;
};

export type Battle = {
  modelA: string;
  modelB: string;
  winner: "A" | "B" | "Tie";
};

export function find(this: EloRating[], modelName: string) {
  return this.find((rating) => rating.modelName === modelName);
}
