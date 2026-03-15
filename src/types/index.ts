export interface User {
  user_id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface ScanAnalysis {
  id: string;
  content_text: string;
  subject: string;
  topics: string[];
  difficulty: string;
  num_pages: number;
}

export interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correct_answer: string;
}

export interface Test {
  id: string;
  user_id: string;
  scan_id: string;
  test_name: string;
  test_type: string;
  difficulty: string;
  questions: Question[];
  total_questions: number;
  is_completed: boolean;
  score: number | null;
  timestamp: string;
}

export interface WrongAnswer {
  question_id: string;
  question: string;
  user_answer: string;
  correct_answer: string;
}

export interface TestResult {
  id: string;
  user_id: string;
  test_id: string;
  test_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  correct_answers: string[];
  wrong_answers: WrongAnswer[];
  timestamp: string;
}

export interface ProgressStats {
  total_tests: number;
  avg_score: number;
  total_scans: number;
  streak_days: number;
  badges: Badge[];
  recent_results: TestResult[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
}

export interface FlashCard {
  id: string;
  front: string;
  back: string;
}

export interface FlashCardDeck {
  id: string;
  user_id: string;
  scan_id: string;
  deck_name: string;
  cards: FlashCard[];
  total_cards: number;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  has_attachment: boolean;
  attachment_type: string | null;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  message_count?: number;
  created_at: string;
  updated_at: string;
}

export interface StudyGuideEntry {
  question_id: string;
  question: string;
  user_answer: string;
  correct_answer: string;
  explanation: string;
  tips: string;
  practice_question: string;
}

export interface StudyGuide {
  id: string;
  user_id: string;
  result_id: string;
  test_name: string;
  guides: StudyGuideEntry[];
  timestamp: string;
}
