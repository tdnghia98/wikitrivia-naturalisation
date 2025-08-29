export interface DateInfo {
  precision: "year" | "month" | "day" | "circa";
  start: number; // Year
  end?: number; // Year for ranges
  display: string; // Human readable format
  originalDate?: string; // Original Wikidata date string
}

export interface Item {
  date_prop_id: string;
  description: string;
  id: string;
  image: string;
  instance_of: string[];
  label: string;
  num_sitelinks: number;
  occupations: string[] | null;
  page_views: number;
  wikipedia_title: string;
  year: number;
  // Extended date information for new game modes
  dateInfo?: DateInfo;
}

export type PlayedItem = Item & {
  played: {
    correct: boolean;
    userAnswer?: string | number; // For precise mode
    userChoice?: number; // For multiple choice mode (option index)
  };
};
