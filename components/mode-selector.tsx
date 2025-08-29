import React from "react";
import { GameMode } from "../types/game-mode";
import styles from "../styles/mode-selector.module.scss";

interface Props {
  selectedMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export default function ModeSelector(props: Props) {
  const { selectedMode, onModeChange } = props;

  const modes = [
    {
      value: GameMode.Classic,
      label: "Classic",
      description: "Place cards on the timeline"
    },
    {
      value: GameMode.Precise,
      label: "Precise Date",
      description: "Guess the exact year"
    },
    {
      value: GameMode.MultipleChoice,
      label: "Multiple Choice", 
      description: "Quick quiz format"
    }
  ];

  return (
    <div className={styles.modeSelector}>
      <label className={styles.label}>Game Mode:</label>
      <select 
        className={styles.select}
        value={selectedMode}
        onChange={(e) => onModeChange(e.target.value as GameMode)}
        aria-label="Select game mode"
      >
        {modes.map((mode) => (
          <option key={mode.value} value={mode.value}>
            {mode.label} - {mode.description}
          </option>
        ))}
      </select>
    </div>
  );
}