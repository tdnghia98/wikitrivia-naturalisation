import { GameState } from "../types/game";
import { Item } from "../types/item";
import { GameMode, GameModeConfig } from "../types/game-mode";
import { getRandomItem, preloadImage } from "./items";

export default async function createState(
  deck: Item[], 
  gameMode: GameMode = GameMode.Classic,
  gameModeConfig?: Partial<GameModeConfig>
): Promise<GameState> {
  const played = [{ ...getRandomItem(deck, []), played: { correct: true } }];
  const next = getRandomItem(deck, played);
  const nextButOne = getRandomItem(deck, [...played, next]);
  const imageCache = [preloadImage(next.image), preloadImage(nextButOne.image)];

  const defaultConfig: GameModeConfig = {
    mode: gameMode,
    tolerance: gameMode === GameMode.Precise ? 1 : undefined,
    difficultyLevel: "normal"
  };

  return {
    badlyPlaced: null,
    deck,
    imageCache,
    lives: 3,
    next,
    nextButOne,
    played,
    gameMode,
    gameModeConfig: { ...defaultConfig, ...gameModeConfig }
  };
}
