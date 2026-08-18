# پلتفرم یادگیری محلی DevOps / SRE

برنامهٔ شخصی برای آموزش DevOps تا SRE با درس روزانه، تمرین عملی، سناریوی تولید، آزمون، نمره، یادگیری تطبیقی و ترمینال لینوکس داخل Docker ایزوله.

رابط کاربری فارسی و راست‌به‌چپ است. شناسه‌های فنی، API و دیتابیس انگلیسی هستند.

## نیازمندی‌ها

- Windows 10/11
- Node.js 20.9+ (LTS)
- npm
- Docker Desktop (برای آزمایشگاه‌ها و ترمینال مرورگر)
- اختیاری: کلید [AvalAI](https://avalai.ir) برای تولید و نمرهٔ کیفی AI

بدون کلید AI، درس‌ها، تمرین‌ها، آزمون‌ها و پیشرفت آفلاین کار می‌کنند. ترمینال فقط به Docker Desktop نیاز دارد نه اینترنت.

## نصب

```powershell
copy .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run lab:build
npm run dev
```

سپس مرورگر را روی `http://localhost:3000` باز کنید.

حساب‌های محلی پیش‌فرض:

- ادمین: `admin` / `admin123`
- یادگیر: `learner` / `learner123`

رمزها را بعد از اولین ورود عوض کنید (فعلاً از طریق seed دوباره با متغیر محیطی).

## متغیرهای محیطی

جدول کامل در `.env.example` است. مهم‌ترین‌ها:

- `DATABASE_URL` — SQLite، پیش‌فرض `file:./dev.db`
- `AUTH_SECRET` — امضای نشست و توکن ترمینال
- `AVALAI_API_KEY` / `AVALAI_BASE_URL` / `AVALAI_MODEL`
- `LAB_CPU_LIMIT` / `LAB_MEMORY_LIMIT` / `LAB_TIMEOUT_SECONDS` / `LAB_MAX_PROCESSES`
- `NEXT_PUBLIC_TERMINAL_GATEWAY_URL` — پیش‌فرض `ws://127.0.0.1:3001`

کلید API هرگز به مرورگر فرستاده نمی‌شود.

## اسکریپت‌ها

| فرمان | کار |
| --- | --- |
| `npm run dev` | Next.js + درگاه ترمینال PTY |
| `npm run build` | بیلد تولید |
| `npm run start` | اجرای بیلد + درگاه ترمینال |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run db:migrate` | مهاجرت Prisma |
| `npm run db:seed` | محتوای اولیه شامل ۷ روز کامل |
| `npm run lab:build` | ساخت ایمیج آزمایشگاه |

## Docker Compose (اختیاری)

```powershell
docker compose up --build
```

سوکت Docker فقط به سرویس `app` وصل می‌شود تا کانتینرهای لب ساخته شوند. کانتینر دانشجو هرگز `/var/run/docker.sock` را نمی‌بیند و فرمان‌ها روی ویندوز میزبان اجرا نمی‌شوند.

## مسیر یادگیری روز ۱

1. ورود با `learner`
2. داشبورد
3. درس امروز
4. خواندن نظریه و ثبت آن
5. شروع تمرین عملی و ترمینال
6. اعتبارسنجی
7. سناریوی «سرور کند است»
8. آزمون ۱۰ سؤالی
9. مشاهده نمره، موضوعات ضعیف و صف مرور
10. رفتن به روز ۲ پس از قبولی

## عیب‌یابی

**ترمینال وصل نمی‌شود**
Docker Desktop را روشن کنید، `npm run lab:build` را اجرا کنید، و پورت `3001` را آزاد بگذارید.

**خطای محیط آزمایشگاه**
ایمیج `devops-learn-lab:latest` باید موجود باشد. WSL2 backend در Docker Desktop توصیه می‌شود.

**مهاجرت دیتابیس**
فایل SQLite در `prisma/dev.db` است. اگر خراب شد حذفش کنید و دوباره `migrate` و `seed` بزنید.

**AvalAI**
اگر کلید خالی باشد برنامه از نمره‌دهی قطعی و محتوای seed استفاده می‌کند.
