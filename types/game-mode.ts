export enum GameMode {
  Classic = "classic",
  Precise = "precise", 
  MultipleChoice = "multiple-choice"
}

export interface GameModeConfig {
  mode: GameMode;
  tolerance?: number; // For precise mode: ±years tolerance
  difficultyLevel?: "easy" | "normal" | "hard";
}