import { useState, useEffect } from "react";
import { QuestionService } from "@orion/task-system";
import { Question } from "../types/Question";

interface UseQuestionListReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  handleDeleteQuestion: (id: string) => Promise<void>;
  refreshQuestions: () => Promise<void>;
}

export const useQuestionList = (): UseQuestionListReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<(() => void) | null>(null);

  useEffect(() => {
    const sub = QuestionService.subscribeQuestions((items, isSynced) => {
      setQuestions(items);
      setLoading(false);
      console.log(
        "[useQuestionList] Questions updated:",
        items.length,
        "synced:",
        isSynced
      );
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
      console.error("Error deleting question:", err);
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
      console.error("Error refreshing questions:", err);
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
