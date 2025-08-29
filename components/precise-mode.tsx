import React from "react";
import { Item } from "../types/item";
import { validateDateInput, checkPreciseAnswer } from "../lib/game-mode-utils";
import styles from "../styles/precise-mode.module.scss";

interface Props {
  item: Item;
  tolerance: number;
  onAnswer: (answer: string, correct: boolean) => void;
}

export default function PreciseMode(props: Props) {
  const { item, tolerance, onAnswer } = props;
  const [userInput, setUserInput] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !userInput.trim()) return;

    setIsSubmitting(true);

    const validation = validateDateInput(userInput.trim());
    if (!validation.valid || validation.year === undefined) {
      alert("Please enter a valid year (YYYY) or date (YYYY-MM-DD)");
      setIsSubmitting(false);
      return;
    }

    const result = checkPreciseAnswer(item, validation.year, tolerance);
    
    onAnswer(userInput.trim(), result.correct);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.preciseMode}>
      <div className={styles.question}>
        <h3>When did this happen?</h3>
        <p className={styles.tolerance}>
          {tolerance === 0 ? "Exact year required" : `±${tolerance} year${tolerance === 1 ? "" : "s"} tolerance`}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter year (e.g., 1969) or date (e.g., 1969-07-20)"
            className={styles.dateInput}
            disabled={isSubmitting}
            autoFocus
            aria-label="Enter the year or date"
          />
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting || !userInput.trim()}
          >
            Submit
          </button>
        </div>
        
        <div className={styles.help}>
          <p>Enter a year (1969) or full date (1969-07-20)</p>
        </div>
      </form>
    </div>
  );
}