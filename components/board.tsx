import React from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { GameState } from "../types/game";
import { GameMode } from "../types/game-mode";
import useAutoMoveSensor from "../lib/useAutoMoveSensor";
import { checkCorrect, getRandomItem, preloadImage } from "../lib/items";
import NextItemList from "./next-item-list";
import PlayedItemList from "./played-item-list";
import PreciseMode from "./precise-mode";
import MultipleChoiceMode from "./multiple-choice-mode";
import styles from "../styles/board.module.scss";
import Hearts from "./hearts";
import GameOver from "./game-over";

interface Props {
  highscore: number;
  resetGame: () => void;
  state: GameState;
  setState: (state: GameState) => void;
  updateHighscore: (score: number) => void;
}

export default function Board(props: Props) {
  const { highscore, resetGame, state, setState, updateHighscore } = props;

  const [isDragging, setIsDragging] = React.useState(false);

  async function onDragStart() {
    setIsDragging(true);
    navigator.vibrate(20);
  }

  async function onDragEnd(result: DropResult) {
    setIsDragging(false);

    const { source, destination } = result;

    if (
      !destination ||
      state.next === null ||
      (source.droppableId === "next" && destination.droppableId === "next")
    ) {
      return;
    }

    const item = { ...state.next };

    if (source.droppableId === "next" && destination.droppableId === "played") {
      const newDeck = [...state.deck];
      const newPlayed = [...state.played];
      const { correct, delta } = checkCorrect(
        newPlayed,
        item,
        destination.index
      );
      newPlayed.splice(destination.index, 0, {
        ...state.next,
        played: { correct },
      });

      const newNext = state.nextButOne;
      const newNextButOne = getRandomItem(
        newDeck,
        newNext ? [...newPlayed, newNext] : newPlayed
      );
      const newImageCache = [preloadImage(newNextButOne.image)];

      setState({
        ...state,
        deck: newDeck,
        imageCache: newImageCache,
        next: newNext,
        nextButOne: newNextButOne,
        played: newPlayed,
        lives: correct ? state.lives : state.lives - 1,
        badlyPlaced: correct
          ? null
          : {
              index: destination.index,
              rendered: false,
              delta,
            },
      });
    } else if (
      source.droppableId === "played" &&
      destination.droppableId === "played"
    ) {
      const newPlayed = [...state.played];
      const [item] = newPlayed.splice(source.index, 1);
      newPlayed.splice(destination.index, 0, item);

      setState({
        ...state,
        played: newPlayed,
        badlyPlaced: null,
      });
    }
  }

  // Handle precise mode answer submission
  async function onPreciseAnswer(answer: string, correct: boolean) {
    if (!state.next) return;

    const item = { ...state.next };
    const newDeck = [...state.deck];
    const newPlayed = [...state.played];
    
    newPlayed.push({
      ...item,
      played: { correct, userAnswer: answer },
    });

    const newNext = state.nextButOne;
    const newNextButOne = getRandomItem(
      newDeck,
      newNext ? [...newPlayed, newNext] : newPlayed
    );
    const newImageCache = [preloadImage(newNextButOne.image)];

    setState({
      ...state,
      deck: newDeck,
      imageCache: newImageCache,
      next: newNext,
      nextButOne: newNextButOne,
      played: newPlayed,
      lives: correct ? state.lives : state.lives - 1,
      badlyPlaced: null,
    });
  }

  // Handle multiple choice answer selection
  async function onMultipleChoiceAnswer(selectedIndex: number, correct: boolean) {
    if (!state.next) return;

    const item = { ...state.next };
    const newDeck = [...state.deck];
    const newPlayed = [...state.played];
    
    newPlayed.push({
      ...item,
      played: { correct, userChoice: selectedIndex },
    });

    const newNext = state.nextButOne;
    const newNextButOne = getRandomItem(
      newDeck,
      newNext ? [...newPlayed, newNext] : newPlayed
    );
    const newImageCache = [preloadImage(newNextButOne.image)];

    setState({
      ...state,
      deck: newDeck,
      imageCache: newImageCache,
      next: newNext,
      nextButOne: newNextButOne,
      played: newPlayed,
      lives: correct ? state.lives : state.lives - 1,
      badlyPlaced: null,
    });
  }

  // Ensure that newly placed items are rendered as draggables before trying to
  // move them to the right place if needed.
  React.useLayoutEffect(() => {
    if (
      state.badlyPlaced &&
      state.badlyPlaced.index !== null &&
      !state.badlyPlaced.rendered
    ) {
      setState({
        ...state,
        badlyPlaced: { ...state.badlyPlaced, rendered: true },
      });
    }
  }, [setState, state]);

  const score = React.useMemo(() => {
    return state.played.filter((item) => item.played.correct).length - 1;
  }, [state.played]);

  React.useLayoutEffect(() => {
    if (score > highscore) {
      updateHighscore(score);
    }
  }, [score, highscore, updateHighscore]);

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      sensors={[useAutoMoveSensor.bind(null, state)]}
    >
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <Hearts lives={state.lives} />
          {state.lives > 0 ? (
            <>
              {state.gameMode === GameMode.Classic && (
                <NextItemList next={state.next} />
              )}
              
              {state.gameMode === GameMode.Precise && state.next && (
                <div className={styles.gameModeContainer}>
                  <NextItemList next={state.next} />
                  <PreciseMode
                    item={state.next}
                    tolerance={state.gameModeConfig.tolerance || 1}
                    onAnswer={onPreciseAnswer}
                  />
                </div>
              )}
              
              {state.gameMode === GameMode.MultipleChoice && state.next && (
                <div className={styles.gameModeContainer}>
                  <NextItemList next={state.next} />
                  <MultipleChoiceMode
                    item={state.next}
                    allItems={state.deck}
                    difficulty={state.gameModeConfig.difficultyLevel || "normal"}
                    onAnswer={onMultipleChoiceAnswer}
                  />
                </div>
              )}
            </>
          ) : (
            <GameOver
              highscore={highscore}
              resetGame={resetGame}
              score={score}
            />
          )}
        </div>
        <div id="bottom" className={styles.bottom}>
          <PlayedItemList
            badlyPlacedIndex={
              state.badlyPlaced === null ? null : state.badlyPlaced.index
            }
            isDragging={isDragging}
            items={state.played}
          />
        </div>
      </div>
    </DragDropContext>
  );
}
