import React from "react";
import GitHubButton from "react-github-btn";
import styles from "../styles/instructions.module.scss";
import Button from "./button";
import Score from "./score";
import ModeSelector from "./mode-selector";
import { GameMode } from "../types/game-mode";

interface Props {
  highscore: number;
  start: (gameMode: GameMode) => void;
}

export default function Instructions(props: Props) {
  const { highscore, start } = props;
  
  const [selectedMode, setSelectedMode] = React.useState<GameMode>(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("wikitrivia-game-mode");
      return (savedMode as GameMode) || GameMode.Classic;
    }
    return GameMode.Classic;
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wikitrivia-game-mode", selectedMode);
    }
  }, [selectedMode]);

  const handleStart = () => {
    start(selectedMode);
  };

  const getInstructionText = (mode: GameMode) => {
    switch (mode) {
      case GameMode.Precise:
        return "Guess the exact year for each historical event.";
      case GameMode.MultipleChoice:
        return "Choose the correct year from the given options.";
      case GameMode.Classic:
      default:
        return "Place the cards on the timeline in the correct order.";
    }
  };

  return (
    <div className={styles.instructions}>
      <div className={styles.wrapper}>
        <h2>{getInstructionText(selectedMode)}</h2>
        <ModeSelector 
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
        />
        {highscore !== 0 && (
          <div className={styles.highscoreWrapper}>
            <Score score={highscore} title="Best streak" />
          </div>
        )}
        <Button onClick={handleStart} text="Start game" />
        <div className={styles.about}>
          <div>
            All data sourced from{" "}
            <a
              href="https://www.wikidata.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikidata
            </a>{" "}
            and{" "}
            <a
              href="https://www.wikipedia.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikipedia
            </a>
            .
          </div>
          <div>
            Have feedback? Please report it on{" "}
            <a
              href="https://github.com/tom-james-watson/wikitrivia/issues/"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </div>
          <GitHubButton
            href="https://github.com/tom-james-watson/wikitrivia"
            data-size="large"
            data-show-count="true"
            aria-label="Star tom-james-watson/wikitrivia on GitHub"
          >
            Star
          </GitHubButton>
        </div>
      </div>
    </div>
  );
}
