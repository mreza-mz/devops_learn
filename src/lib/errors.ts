export class AppError extends Error {
  readonly code: string;
  readonly userMessage: string;
  readonly status: number;

  constructor(code: string, userMessage: string, status = 400) {
    super(code);
    this.code = code;
    this.userMessage = userMessage;
    this.status = status;
  }
}

export const errors = {
  unauthorized: () => new AppError("UNAUTHORIZED", "برای ادامه باید وارد شوید.", 401),
  forbidden: () => new AppError("FORBIDDEN", "اجازهٔ دسترسی به این بخش را ندارید.", 403),
  notFound: (item = "مورد") => new AppError("NOT_FOUND", `${item} پیدا نشد.`, 404),
  validation: (message = "اطلاعات واردشده معتبر نیست.") =>
    new AppError("VALIDATION", message, 422),
  docker: () =>
    new AppError(
      "DOCKER_UNAVAILABLE",
      "محیط آزمایشگاه در دسترس نیست. Docker Desktop را بررسی کنید.",
      503,
    ),
  aiUnavailable: () =>
    new AppError(
      "AI_UNAVAILABLE",
      "هوش مصنوعی در دسترس نیست. بخش‌های آفلاین همچنان کار می‌کنند.",
      503,
    ),
  timeout: () => new AppError("TIMEOUT", "زمان درخواست به پایان رسید.", 504),
  rateLimited: () =>
    new AppError("RATE_LIMITED", "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.", 429),
  labExpired: () => new AppError("LAB_EXPIRED", "زمان این آزمایشگاه به پایان رسیده است.", 410),
};

export function toUserError(error: unknown): { message: string; status: number } {
  if (error instanceof AppError) {
    return { message: error.userMessage, status: error.status };
  }
  return { message: "خطای غیرمنتظره‌ای رخ داد.", status: 500 };
}
