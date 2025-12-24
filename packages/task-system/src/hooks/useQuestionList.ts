import { useState, useEffect } from "react";
import { QuestionService } from "@services/QuestionService";
import { Question } from "@task-types/Question";
import { getServiceLogger } from "@utils/serviceLogger";

const logger = getServiceLogger("useQuestionList");

/**
 * Return type for the useQuestionList hook.
 */
interface UseQuestionListReturn {
  /** List of all questions */
  questions: Question[];
  /** Whether initial data is still loading */
  loading: boolean;
  /** Error message from the most recent operation, or null */
  error: string | null;
  /** Deletes a question by ID */
  handleDeleteQuestion: (id: string) => Promise<void>;
  /** Manually refreshes the question list */
  refreshQuestions: () => Promise<void>;
}

/**
 * React hook for managing questions with real-time synchronization.
 *
 * Provides reactive question data via DataStore subscriptions and
 * question management operations. Questions are automatically updated
 * when changes occur in the DataStore.
 *
 * @returns Object containing question data, loading states, and management operations
 *
 * @example
 * ```tsx
 * const {
 *   questions,
 *   loading,
 *   handleDeleteQuestion,
 * } = useQuestionList();
 *
 * // Display questions
 * questions.map(q => <QuestionCard key={q.id} question={q} />);
 *
 * // Delete a question
 * await handleDeleteQuestion("question-123");
 * ```
 */
export const useQuestionList = (): UseQuestionListReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<(() => void) | null>(null);

  useEffect(() => {
    const sub = QuestionService.subscribeQuestions((items, isSynced) => {
      setQuestions(items);
      setLoading(false);
      logger.debug("Questions updated", {
        count: items.length,
        synced: isSynced,
      });
    });
    setSubscription(() => sub.unsubscribe);

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

  const handleDeleteQuestion = async (id: string): Promise<void> => {
    try {
      await QuestionService.deleteQuestion(id);
    } catch (err) {
      logger.error("Error deleting question", err);
      setError("Failed to delete question.");
    }
  };

  const refreshQuestions = async (): Promise<void> => {
    try {
      setLoading(true);
      const allQuestions = await QuestionService.getQuestions();
      setQuestions(allQuestions);
      setLoading(false);
    } catch (err) {
      logger.error("Error refreshing questions", err);
      setError("Failed to refresh questions.");
      setLoading(false);
    }
  };

  return {
    questions,
    loading,
    error,
    handleDeleteQuestion,
    refreshQuestions,
  };
};
