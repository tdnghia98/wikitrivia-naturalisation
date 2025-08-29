import React from "react";
import { Item } from "../types/item";
import { generateMultipleChoiceOptions } from "../lib/game-mode-utils";
import styles from "../styles/multiple-choice-mode.module.scss";

interface Props {
  item: Item;
  allItems: Item[];
  difficulty: "easy" | "normal" | "hard";
  onAnswer: (selectedIndex: number, correct: boolean) => void;
}

export default function MultipleChoiceMode(props: Props) {
  const { item, allItems, difficulty, onAnswer } = props;
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const { options, correctIndex } = React.useMemo(() => 
    generateMultipleChoiceOptions(item, allItems, difficulty),
    [item, allItems, difficulty]
  );

  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitting) return;
    
    setSelectedOption(optionIndex);
    setIsSubmitting(true);
    
    const correct = optionIndex === correctIndex;
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      onAnswer(optionIndex, correct);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent, optionIndex: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOptionSelect(optionIndex);
    }
  };

  const getOptionClass = (optionIndex: number) => {
    if (selectedOption === null) {
      return styles.option;
    }
    
    if (optionIndex === correctIndex) {
      return `${styles.option} ${styles.correct}`;
    }
    
    if (optionIndex === selectedOption && optionIndex !== correctIndex) {
      return `${styles.option} ${styles.incorrect}`;
    }
    
    return `${styles.option} ${styles.disabled}`;
  };

  return (
    <div className={styles.multipleChoice}>
      <div className={styles.question}>
        <h3>When did this happen?</h3>
        <p className={styles.difficulty}>
          Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </p>
      </div>
      
      <div className={styles.options}>
        {options.map((year, index) => (
          <button
            key={index}
            className={getOptionClass(index)}
            onClick={() => handleOptionSelect(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={isSubmitting}
            aria-label={`Option ${index + 1}: ${year}`}
          >
            <span className={styles.optionLetter}>
              {String.fromCharCode(65 + index)}
            </span>
            <span className={styles.optionYear}>{year}</span>
          </button>
        ))}
      </div>
      
      {selectedOption !== null && (
        <div className={styles.feedback}>
          {selectedOption === correctIndex ? (
            <p className={styles.correctFeedback}>Correct! 🎉</p>
          ) : (
            <p className={styles.incorrectFeedback}>
              Incorrect. The answer was {options[correctIndex]}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}