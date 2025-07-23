-- CreateTable
CREATE TABLE "EmailDraft" (
    "id" SERIAL NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "to_emails" TEXT DEFAULT '[]',
    "cc_emails" TEXT DEFAULT '[]',
    "bcc_emails" TEXT DEFAULT '[]',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "schedule_date" TIMESTAMP(3),
    "schedule_time" TEXT,
    "use_template" BOOLEAN NOT NULL DEFAULT false,
    "selected_template_id" INTEGER,
    "personalize_content" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailDraft_pkey" PRIMARY KEY ("id")
);
