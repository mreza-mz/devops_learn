import { describe, expect, it } from "vitest";
import { gradeExamAnswers } from "@/services/exam/exam-engine";

describe("exam grading integration", () => {
  it("scores mixed deterministic questions", async () => {
    const result = await gradeExamAnswers(
      [
        {
          id: "q1",
          type: "MULTIPLE_CHOICE",
          promptFa: "کجا؟",
          correctAnswer: "/etc",
          points: 10,
        },
        {
          id: "q2",
          type: "TRUE_FALSE",
          promptFa: "؟",
          correctAnswer: "نادرست",
          points: 10,
        },
        {
          id: "q3",
          type: "COMMAND",
          promptFa: "pwd",
          correctAnswer: "pwd",
          points: 10,
        },
      ],
      { q1: "/etc", q2: "درست", q3: "pwd" },
    );
    expect(result.percent).toBeCloseTo(66.67, 1);
    expect(result.answers[1]?.isCorrect).toBe(false);
  });
});
