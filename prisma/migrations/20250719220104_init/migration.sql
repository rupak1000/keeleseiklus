-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "level" TEXT NOT NULL DEFAULT 'A1',
    "enrollment_date" TIMESTAMP(3) NOT NULL,
    "last_active" TIMESTAMP(3) NOT NULL,
    "total_time_spent" TEXT NOT NULL DEFAULT '0h 0m',
    "streak" INTEGER NOT NULL DEFAULT 0,
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "exam_status" TEXT DEFAULT 'not_taken',
    "exam_score" INTEGER DEFAULT 0,
    "exam_attempts" INTEGER DEFAULT 0,
    "subscription" TEXT DEFAULT 'Free',
    "subscription_status" TEXT DEFAULT 'free',
    "subscription_date" TIMESTAMP(3),
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "country" TEXT,
    "preferred_language" TEXT DEFAULT 'English',
    "notes" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentModule" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamTemplate" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "passing_score" INTEGER NOT NULL DEFAULT 70,
    "time_limit" INTEGER NOT NULL DEFAULT 120,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExamTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSection" (
    "id" SERIAL NOT NULL,
    "exam_template_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "time_limit" INTEGER,
    "max_points" INTEGER NOT NULL DEFAULT 0,
    "randomize_questions" BOOLEAN NOT NULL DEFAULT false,
    "passing_score" INTEGER,

    CONSTRAINT "ExamSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB,
    "correct_answer" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "hint" TEXT,
    "explanation" TEXT,
    "module_id" INTEGER,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "tags" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentExamAttempt" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "exam_template_id" INTEGER NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "total_points" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "time_spent" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "section_scores" JSONB NOT NULL,
    "certificate_issued" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudentExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "exam_template_id" INTEGER,
    "score" INTEGER NOT NULL,
    "completed_modules" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL,
    "certificate_number" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateSettings" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cefr_level" TEXT NOT NULL,
    "institution_name" TEXT NOT NULL,
    "institution_subtitle" TEXT NOT NULL,
    "signatory_name" TEXT NOT NULL,
    "signatory_title" TEXT NOT NULL,
    "auto_generate" BOOLEAN NOT NULL DEFAULT true,
    "email_delivery" BOOLEAN NOT NULL DEFAULT false,
    "template" TEXT NOT NULL DEFAULT 'default',

    CONSTRAINT "CertificateSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamRequirement" (
    "id" SERIAL NOT NULL,
    "require_all_modules" BOOLEAN NOT NULL DEFAULT true,
    "min_modules_required" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "ExamRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "title_ru" TEXT,
    "subtitle" TEXT,
    "subtitle_ru" TEXT,
    "level" TEXT NOT NULL DEFAULT 'A1',
    "duration" TEXT NOT NULL DEFAULT '3 hours',
    "description" TEXT,
    "description_ru" TEXT,
    "location" TEXT,
    "region" TEXT DEFAULT 'Estonia',
    "video_url" TEXT,
    "map_position_x" DOUBLE PRECISION NOT NULL DEFAULT 58,
    "map_position_y" DOUBLE PRECISION NOT NULL DEFAULT 24,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleStory" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "text_ru" TEXT,
    "hint" TEXT,
    "hint_ru" TEXT,
    "mission" TEXT NOT NULL,
    "mission_ru" TEXT,
    "show_translation" BOOLEAN NOT NULL DEFAULT false,
    "video_url" TEXT,

    CONSTRAINT "ModuleStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleStoryCharacter" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "character_name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleStoryCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleVocabulary" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "translation_ru" TEXT,
    "example" TEXT,
    "example_ru" TEXT,
    "audio_url" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleVocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleGrammar" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "title_ru" TEXT,
    "explanation" TEXT NOT NULL,
    "explanation_ru" TEXT,

    CONSTRAINT "ModuleGrammar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleGrammarRule" (
    "id" SERIAL NOT NULL,
    "grammar_id" INTEGER NOT NULL,
    "rule" TEXT NOT NULL,
    "rule_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleGrammarRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleGrammarExample" (
    "id" SERIAL NOT NULL,
    "grammar_id" INTEGER NOT NULL,
    "example" TEXT NOT NULL,
    "example_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleGrammarExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleGrammarExercise" (
    "id" SERIAL NOT NULL,
    "grammar_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleGrammarExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModulePronunciation" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "audio_url" TEXT NOT NULL,

    CONSTRAINT "ModulePronunciation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleListening" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "audio_url" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "transcript_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleListening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleSpeaking" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "prompt_ru" TEXT,
    "audio_url" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleSpeaking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleReading" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "text_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleWriting" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "prompt_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleWriting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleCultural" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "content_ru" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleCultural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleQuiz" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleMissionChallenge" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "challenge" TEXT NOT NULL,
    "solution" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ModuleMissionChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- CreateIndex
CREATE INDEX "Student_subscription_idx" ON "Student"("subscription");

-- CreateIndex
CREATE INDEX "StudentModule_student_id_idx" ON "StudentModule"("student_id");

-- CreateIndex
CREATE INDEX "StudentModule_module_id_idx" ON "StudentModule"("module_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentModule_student_id_module_id_key" ON "StudentModule"("student_id", "module_id");

-- CreateIndex
CREATE INDEX "ExamTemplate_is_active_idx" ON "ExamTemplate"("is_active");

-- CreateIndex
CREATE INDEX "ExamTemplate_is_published_idx" ON "ExamTemplate"("is_published");

-- CreateIndex
CREATE INDEX "ExamSection_exam_template_id_idx" ON "ExamSection"("exam_template_id");

-- CreateIndex
CREATE INDEX "ExamQuestion_section_id_idx" ON "ExamQuestion"("section_id");

-- CreateIndex
CREATE INDEX "ExamQuestion_module_id_idx" ON "ExamQuestion"("module_id");

-- CreateIndex
CREATE INDEX "StudentExamAttempt_student_id_idx" ON "StudentExamAttempt"("student_id");

-- CreateIndex
CREATE INDEX "StudentExamAttempt_exam_template_id_idx" ON "StudentExamAttempt"("exam_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificate_number_key" ON "Certificate"("certificate_number");

-- CreateIndex
CREATE INDEX "Certificate_student_id_idx" ON "Certificate"("student_id");

-- CreateIndex
CREATE INDEX "Certificate_exam_template_id_idx" ON "Certificate"("exam_template_id");

-- CreateIndex
CREATE INDEX "Module_level_idx" ON "Module"("level");

-- CreateIndex
CREATE INDEX "ModuleStory_module_id_idx" ON "ModuleStory"("module_id");

-- CreateIndex
CREATE INDEX "ModuleStoryCharacter_module_id_idx" ON "ModuleStoryCharacter"("module_id");

-- CreateIndex
CREATE INDEX "ModuleVocabulary_module_id_idx" ON "ModuleVocabulary"("module_id");

-- CreateIndex
CREATE INDEX "ModuleGrammar_module_id_idx" ON "ModuleGrammar"("module_id");

-- CreateIndex
CREATE INDEX "ModuleGrammarRule_grammar_id_idx" ON "ModuleGrammarRule"("grammar_id");

-- CreateIndex
CREATE INDEX "ModuleGrammarExample_grammar_id_idx" ON "ModuleGrammarExample"("grammar_id");

-- CreateIndex
CREATE INDEX "ModuleGrammarExercise_grammar_id_idx" ON "ModuleGrammarExercise"("grammar_id");

-- CreateIndex
CREATE INDEX "ModulePronunciation_module_id_idx" ON "ModulePronunciation"("module_id");

-- CreateIndex
CREATE INDEX "ModuleListening_module_id_idx" ON "ModuleListening"("module_id");

-- CreateIndex
CREATE INDEX "ModuleSpeaking_module_id_idx" ON "ModuleSpeaking"("module_id");

-- CreateIndex
CREATE INDEX "ModuleReading_module_id_idx" ON "ModuleReading"("module_id");

-- CreateIndex
CREATE INDEX "ModuleWriting_module_id_idx" ON "ModuleWriting"("module_id");

-- CreateIndex
CREATE INDEX "ModuleCultural_module_id_idx" ON "ModuleCultural"("module_id");

-- CreateIndex
CREATE INDEX "ModuleQuiz_module_id_idx" ON "ModuleQuiz"("module_id");

-- CreateIndex
CREATE INDEX "ModuleMissionChallenge_module_id_idx" ON "ModuleMissionChallenge"("module_id");

-- CreateIndex
CREATE INDEX "AuditLog_user_id_idx" ON "AuditLog"("user_id");

-- AddForeignKey
ALTER TABLE "StudentModule" ADD CONSTRAINT "StudentModule_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentModule" ADD CONSTRAINT "StudentModule_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSection" ADD CONSTRAINT "ExamSection_exam_template_id_fkey" FOREIGN KEY ("exam_template_id") REFERENCES "ExamTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "ExamSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentExamAttempt" ADD CONSTRAINT "StudentExamAttempt_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentExamAttempt" ADD CONSTRAINT "StudentExamAttempt_exam_template_id_fkey" FOREIGN KEY ("exam_template_id") REFERENCES "ExamTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_exam_template_id_fkey" FOREIGN KEY ("exam_template_id") REFERENCES "ExamTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleStory" ADD CONSTRAINT "ModuleStory_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleStoryCharacter" ADD CONSTRAINT "ModuleStoryCharacter_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleVocabulary" ADD CONSTRAINT "ModuleVocabulary_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleGrammar" ADD CONSTRAINT "ModuleGrammar_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleGrammarRule" ADD CONSTRAINT "ModuleGrammarRule_grammar_id_fkey" FOREIGN KEY ("grammar_id") REFERENCES "ModuleGrammar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleGrammarExample" ADD CONSTRAINT "ModuleGrammarExample_grammar_id_fkey" FOREIGN KEY ("grammar_id") REFERENCES "ModuleGrammar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleGrammarExercise" ADD CONSTRAINT "ModuleGrammarExercise_grammar_id_fkey" FOREIGN KEY ("grammar_id") REFERENCES "ModuleGrammar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulePronunciation" ADD CONSTRAINT "ModulePronunciation_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleListening" ADD CONSTRAINT "ModuleListening_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleSpeaking" ADD CONSTRAINT "ModuleSpeaking_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleReading" ADD CONSTRAINT "ModuleReading_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleWriting" ADD CONSTRAINT "ModuleWriting_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleCultural" ADD CONSTRAINT "ModuleCultural_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleQuiz" ADD CONSTRAINT "ModuleQuiz_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleMissionChallenge" ADD CONSTRAINT "ModuleMissionChallenge_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
