import { aiService } from "@/server/ai/service";
import { roundScore } from "@/lib/utils";

export type ExamQuestionInput = {
  id: string;
  type: string;
  promptFa: string;
  correctAnswer: string;
  points: number;
};

export type GradedAnswer = {
  questionId: string;
  response: string;
  isCorrect: boolean;
  score: number;
  feedbackFa: string;
};

export async function gradeExamAnswers(
  questions: ExamQuestionInput[],
  responses: Record<string, string>,
): Promise<{ answers: GradedAnswer[]; totalScore: number; percent: number }> {
  const answers: GradedAnswer[] = [];
  let earned = 0;
  let max = 0;

  for (const question of questions) {
    max += question.points;
    const response = responses[question.id] ?? "";
    const deterministicTypes = ["MULTIPLE_CHOICE", "TRUE_FALSE", "COMMAND"];
    if (deterministicTypes.includes(question.type)) {
      const isCorrect = normalize(response) === normalize(question.correctAnswer);
      const score = isCorrect ? question.points : 0;
      earned += score;
      answers.push({
        questionId: question.id,
        response,
        isCorrect,
        score,
        feedbackFa: isCorrect ? "پاسخ درست است." : `پاسخ درست: ${question.correctAnswer}`,
      });
      continue;
    }

    const ai = await aiService.gradeAnswer({
      promptFa: question.promptFa,
      expected: question.correctAnswer,
      response,
      type: question.type,
    });
    const score = roundScore((ai.score / 100) * question.points);
    earned += score;
    answers.push({
      questionId: question.id,
      response,
      isCorrect: ai.score >= 70,
      score,
      feedbackFa: ai.feedbackFa,
    });
  }

  const percent = max === 0 ? 0 : (earned / max) * 100;
  return { answers, totalScore: roundScore(earned), percent: roundScore(percent) };
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
