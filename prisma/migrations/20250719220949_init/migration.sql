/*
  Warnings:

  - You are about to drop the column `metadata` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `ModuleCultural` table. All the data in the column will be lost.
  - You are about to drop the column `example` on the `ModuleGrammarExample` table. All the data in the column will be lost.
  - You are about to drop the column `example_ru` on the `ModuleGrammarExample` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `ModuleListening` table. All the data in the column will be lost.
  - You are about to drop the column `challenge` on the `ModuleMissionChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `ModuleMissionChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `solution` on the `ModuleMissionChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `audio_url` on the `ModulePronunciation` table. All the data in the column will be lost.
  - You are about to drop the column `word` on the `ModulePronunciation` table. All the data in the column will be lost.
  - You are about to drop the column `correct_answer` on the `ModuleQuiz` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `ModuleQuiz` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `ModuleReading` table. All the data in the column will be lost.
  - You are about to drop the column `audio_url` on the `ModuleSpeaking` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `ModuleSpeaking` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `ModuleSpeaking` table. All the data in the column will be lost.
  - You are about to drop the column `prompt_ru` on the `ModuleSpeaking` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `ModuleWriting` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `ModuleWriting` table. All the data in the column will be lost.
  - You are about to drop the column `prompt_ru` on the `ModuleWriting` table. All the data in the column will be lost.
  - Added the required column `souvenir_description` to the `ModuleCultural` table without a default value. This is not possible if the table is not empty.
  - Added the required column `souvenir_name` to the `ModuleCultural` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ModuleCultural` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentence` to the `ModuleGrammarExample` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translation` to the `ModuleGrammarExample` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ModuleGrammarExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `ModuleListening` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `ModuleMissionChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ModuleMissionChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `ModulePronunciation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `focus` to the `ModulePronunciation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answer` to the `ModuleQuiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ModuleQuiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `ModuleSpeaking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `ModuleWriting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Made the column `password_hash` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_user_id_fkey";

-- DropIndex
DROP INDEX "Module_level_idx";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "metadata",
ADD COLUMN     "details" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ExamTemplate" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ModuleCultural" DROP COLUMN "position",
ADD COLUMN     "hint" TEXT,
ADD COLUMN     "hint_ru" TEXT,
ADD COLUMN     "souvenir_description" TEXT NOT NULL,
ADD COLUMN     "souvenir_description_ru" TEXT,
ADD COLUMN     "souvenir_download_url" TEXT,
ADD COLUMN     "souvenir_name" TEXT NOT NULL,
ADD COLUMN     "souvenir_name_ru" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "title_ru" TEXT;

-- AlterTable
ALTER TABLE "ModuleGrammarExample" DROP COLUMN "example",
DROP COLUMN "example_ru",
ADD COLUMN     "sentence" TEXT NOT NULL,
ADD COLUMN     "sentence_ru" TEXT,
ADD COLUMN     "translation" TEXT NOT NULL,
ADD COLUMN     "translation_ru" TEXT;

-- AlterTable
ALTER TABLE "ModuleGrammarExercise" ADD COLUMN     "hint" TEXT,
ADD COLUMN     "hint_ru" TEXT,
ADD COLUMN     "question_ru" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ModuleListening" DROP COLUMN "position",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "content_ru" TEXT,
ADD COLUMN     "hint" TEXT,
ADD COLUMN     "hint_ru" TEXT;

-- AlterTable
ALTER TABLE "ModuleMissionChallenge" DROP COLUMN "challenge",
DROP COLUMN "position",
DROP COLUMN "solution",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "description_ru" TEXT,
ADD COLUMN     "hint" TEXT,
ADD COLUMN     "hint_ru" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "title_ru" TEXT;

-- AlterTable
ALTER TABLE "ModulePronunciation" DROP COLUMN "audio_url",
DROP COLUMN "word",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "content_ru" TEXT,
ADD COLUMN     "focus" TEXT NOT NULL,
ADD COLUMN     "focus_ru" TEXT,
ADD COLUMN     "hint" TEXT,
ADD COLUMN     "hint_ru" TEXT;

-- AlterTable
ALTER TABLE "ModuleQuiz" DROP COLUMN "correct_answer",
DROP COLUMN "options",
ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "audio_url" TEXT,
ADD COLUMN     "hint" TEXT,
ADD COLUMN     "hint_ru" TEXT,
ADD COLUMN     "question_ru" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ModuleReading" DROP COLUMN "position",
ADD COLUMN     "hint" TEXT,
ADD COLUMN     "hint_ru" TEXT;

-- AlterTable
ALTER TABLE "ModuleSpeaking" DROP COLUMN "audio_url",
DROP COLUMN "position",
DROP COLUMN "prompt",
DROP COLUMN "prompt_ru",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "content_ru" TEXT,
ADD COLUMN     "hint" TEXT,
ADD COLUMN     "hint_ru" TEXT;

-- AlterTable
ALTER TABLE "ModuleWriting" DROP COLUMN "position",
DROP COLUMN "prompt",
DROP COLUMN "prompt_ru",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "content_ru" TEXT,
ADD COLUMN     "hint" TEXT,
ADD COLUMN     "hint_ru" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "password_hash" SET NOT NULL,
ALTER COLUMN "enrollment_date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "last_active" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "StudentModule" ALTER COLUMN "completed_at" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ModuleGrammarExerciseOption" (
    "id" SERIAL NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "option_text" TEXT NOT NULL,
    "option_text_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleGrammarExerciseOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModulePronunciationMinimalPair" (
    "id" SERIAL NOT NULL,
    "pronunciation_id" INTEGER NOT NULL,
    "word1" TEXT NOT NULL,
    "word2" TEXT NOT NULL,
    "sound1" TEXT,
    "sound2" TEXT,
    "audio_url1" TEXT,
    "audio_url2" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModulePronunciationMinimalPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModulePronunciationExercise" (
    "id" SERIAL NOT NULL,
    "pronunciation_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "phonetic" TEXT,
    "audio_url" TEXT,
    "hint" TEXT,
    "hint_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModulePronunciationExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleListeningQuestion" (
    "id" SERIAL NOT NULL,
    "listening_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "question_ru" TEXT,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleListeningQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleListeningQuestionOption" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_text" TEXT NOT NULL,
    "option_text_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleListeningQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleSpeakingExercise" (
    "id" SERIAL NOT NULL,
    "speaking_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "prompt_ru" TEXT,
    "expected_response" TEXT NOT NULL,
    "hint" TEXT,
    "hint_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleSpeakingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleReadingQuestion" (
    "id" SERIAL NOT NULL,
    "reading_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "question_ru" TEXT,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleReadingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleReadingQuestionOption" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_text" TEXT NOT NULL,
    "option_text_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleReadingQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleWritingExercise" (
    "id" SERIAL NOT NULL,
    "writing_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "prompt_ru" TEXT,
    "min_words" INTEGER NOT NULL,
    "max_words" INTEGER NOT NULL,
    "hint" TEXT,
    "hint_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleWritingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleQuizOption" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "option_text" TEXT NOT NULL,
    "option_text_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleQuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleMissionRequirement" (
    "id" SERIAL NOT NULL,
    "mission_challenge_id" INTEGER NOT NULL,
    "requirement" TEXT NOT NULL,
    "requirement_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleMissionRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailHistory" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER,
    "to_emails" TEXT NOT NULL,
    "cc_emails" TEXT,
    "bcc_emails" TEXT,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL,
    "recipients_count" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3),
    "scheduled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" SERIAL NOT NULL,
    "welcome_email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "inactivity_reminder_enabled" BOOLEAN NOT NULL DEFAULT false,
    "achievement_notification_enabled" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_module_completion" BOOLEAN NOT NULL DEFAULT false,
    "enable_push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "enable_email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "enable_sms_notifications" BOOLEAN NOT NULL DEFAULT false,
    "notify_on_new_registration" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_exam_completion" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_system_errors" BOOLEAN NOT NULL DEFAULT true,
    "admin_notification_email" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralSettings" (
    "id" SERIAL NOT NULL,
    "app_name" TEXT NOT NULL,
    "app_description" TEXT NOT NULL,
    "support_email" TEXT NOT NULL,
    "default_language" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "registration_enabled" BOOLEAN NOT NULL DEFAULT true,
    "guest_access_enabled" BOOLEAN NOT NULL DEFAULT true,
    "max_students_per_class" INTEGER NOT NULL DEFAULT 30,
    "session_timeout" INTEGER NOT NULL DEFAULT 60,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSettings" (
    "id" SERIAL NOT NULL,
    "smtp_host" TEXT,
    "smtp_port" INTEGER NOT NULL DEFAULT 587,
    "smtp_username" TEXT,
    "smtp_password" TEXT,
    "from_email" TEXT NOT NULL,
    "from_name" TEXT NOT NULL,
    "enable_welcome_emails" BOOLEAN NOT NULL DEFAULT true,
    "enable_progress_emails" BOOLEAN NOT NULL DEFAULT true,
    "enable_certificate_emails" BOOLEAN NOT NULL DEFAULT true,
    "enable_reminder_emails" BOOLEAN NOT NULL DEFAULT false,
    "email_frequency" TEXT NOT NULL DEFAULT 'weekly',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecuritySettings" (
    "id" SERIAL NOT NULL,
    "password_min_length" INTEGER NOT NULL DEFAULT 8,
    "require_special_chars" BOOLEAN NOT NULL DEFAULT true,
    "require_numbers" BOOLEAN NOT NULL DEFAULT true,
    "require_uppercase" BOOLEAN NOT NULL DEFAULT true,
    "enable_two_factor" BOOLEAN NOT NULL DEFAULT false,
    "session_security" TEXT NOT NULL DEFAULT 'standard',
    "ip_whitelist" TEXT NOT NULL DEFAULT '[]',
    "max_login_attempts" INTEGER NOT NULL DEFAULT 5,
    "lockout_duration" INTEGER NOT NULL DEFAULT 15,
    "enable_audit_log" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecuritySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" SERIAL NOT NULL,
    "backup_frequency" TEXT NOT NULL DEFAULT 'daily',
    "retention_period" INTEGER NOT NULL DEFAULT 30,
    "enable_analytics" BOOLEAN NOT NULL DEFAULT true,
    "enable_error_reporting" BOOLEAN NOT NULL DEFAULT true,
    "debug_mode" BOOLEAN NOT NULL DEFAULT false,
    "cache_enabled" BOOLEAN NOT NULL DEFAULT true,
    "compression_enabled" BOOLEAN NOT NULL DEFAULT true,
    "max_file_upload_size" INTEGER NOT NULL DEFAULT 10,
    "subscription_enabled" BOOLEAN NOT NULL DEFAULT true,
    "free_module_limit" INTEGER NOT NULL DEFAULT 10,
    "premium_required" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backup" (
    "id" SERIAL NOT NULL,
    "backup_date" TIMESTAMP(3) NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModuleGrammarExerciseOption_exercise_id_idx" ON "ModuleGrammarExerciseOption"("exercise_id");

-- CreateIndex
CREATE INDEX "ModulePronunciationMinimalPair_pronunciation_id_idx" ON "ModulePronunciationMinimalPair"("pronunciation_id");

-- CreateIndex
CREATE INDEX "ModulePronunciationExercise_pronunciation_id_idx" ON "ModulePronunciationExercise"("pronunciation_id");

-- CreateIndex
CREATE INDEX "ModuleListeningQuestion_listening_id_idx" ON "ModuleListeningQuestion"("listening_id");

-- CreateIndex
CREATE INDEX "ModuleListeningQuestionOption_question_id_idx" ON "ModuleListeningQuestionOption"("question_id");

-- CreateIndex
CREATE INDEX "ModuleSpeakingExercise_speaking_id_idx" ON "ModuleSpeakingExercise"("speaking_id");

-- CreateIndex
CREATE INDEX "ModuleReadingQuestion_reading_id_idx" ON "ModuleReadingQuestion"("reading_id");

-- CreateIndex
CREATE INDEX "ModuleReadingQuestionOption_question_id_idx" ON "ModuleReadingQuestionOption"("question_id");

-- CreateIndex
CREATE INDEX "ModuleWritingExercise_writing_id_idx" ON "ModuleWritingExercise"("writing_id");

-- CreateIndex
CREATE INDEX "ModuleQuizOption_quiz_id_idx" ON "ModuleQuizOption"("quiz_id");

-- CreateIndex
CREATE INDEX "ModuleMissionRequirement_mission_challenge_id_idx" ON "ModuleMissionRequirement"("mission_challenge_id");

-- CreateIndex
CREATE INDEX "EmailTemplate_category_idx" ON "EmailTemplate"("category");

-- CreateIndex
CREATE INDEX "EmailHistory_template_id_idx" ON "EmailHistory"("template_id");

-- CreateIndex
CREATE INDEX "EmailHistory_status_idx" ON "EmailHistory"("status");

-- CreateIndex
CREATE INDEX "EmailHistory_scheduled_at_idx" ON "EmailHistory"("scheduled_at");

-- CreateIndex
CREATE INDEX "Backup_backup_date_idx" ON "Backup"("backup_date");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "ModuleGrammarExerciseOption" ADD CONSTRAINT "ModuleGrammarExerciseOption_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "ModuleGrammarExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulePronunciationMinimalPair" ADD CONSTRAINT "ModulePronunciationMinimalPair_pronunciation_id_fkey" FOREIGN KEY ("pronunciation_id") REFERENCES "ModulePronunciation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulePronunciationExercise" ADD CONSTRAINT "ModulePronunciationExercise_pronunciation_id_fkey" FOREIGN KEY ("pronunciation_id") REFERENCES "ModulePronunciation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleListeningQuestion" ADD CONSTRAINT "ModuleListeningQuestion_listening_id_fkey" FOREIGN KEY ("listening_id") REFERENCES "ModuleListening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleListeningQuestionOption" ADD CONSTRAINT "ModuleListeningQuestionOption_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "ModuleListeningQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleSpeakingExercise" ADD CONSTRAINT "ModuleSpeakingExercise_speaking_id_fkey" FOREIGN KEY ("speaking_id") REFERENCES "ModuleSpeaking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleReadingQuestion" ADD CONSTRAINT "ModuleReadingQuestion_reading_id_fkey" FOREIGN KEY ("reading_id") REFERENCES "ModuleReading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleReadingQuestionOption" ADD CONSTRAINT "ModuleReadingQuestionOption_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "ModuleReadingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleWritingExercise" ADD CONSTRAINT "ModuleWritingExercise_writing_id_fkey" FOREIGN KEY ("writing_id") REFERENCES "ModuleWriting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleQuizOption" ADD CONSTRAINT "ModuleQuizOption_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "ModuleQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleMissionRequirement" ADD CONSTRAINT "ModuleMissionRequirement_mission_challenge_id_fkey" FOREIGN KEY ("mission_challenge_id") REFERENCES "ModuleMissionChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailHistory" ADD CONSTRAINT "EmailHistory_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
