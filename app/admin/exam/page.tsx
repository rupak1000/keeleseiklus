
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  Users,
  BarChart3,
  FileText,
  CheckCircle,
  Eye,
  Download,
  Target,
  Award,
  Send,
  Settings,
  Mail,
  Calendar,
  Clock,
  TrendingUp,
  User,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Interfaces matching Prisma models and API responses
interface ExamQuestion {
  id: number;
  type: "multiple-choice" | "fill-blank" | "true-false" | "short-answer" | "essay" | "matching" | "ordering";
  question: string;
  question_ru?: string;
  options?: string[];
  correct_answer: string | boolean | string[];
  points: number;
  hint?: string;
  explanation?: string;
  module_id?: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

interface ExamSection {
  id: number;
  exam_template_id: number;
  title: string;
  description?: string;
  instructions?: string;
  time_limit?: number;
  max_points: number;
  questions: ExamQuestion[];
  randomize_questions: boolean;
  passing_score?: number;
}

interface ExamTemplate {
  id: number;
  title: string;
  description: string;
  instructions: string;
  totalPoints: number;
  timeLimit: number;
  sections: ExamSection[];
  settings: {
    randomizeQuestions: boolean;
    randomizeSections: boolean;
    showProgressBar: boolean;
    allowBackNavigation: boolean;
    showQuestionNumbers: boolean;
    autoSave: boolean;
    preventCheating: boolean;
    fullScreenMode: boolean;
    passingScore: number;
    maxAttempts: number;
    showResultsImmediately: boolean;
    certificateEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isPublished: boolean;
}

interface ExamResult {
  id: number;
  examId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number;
  attemptNumber: number;
  answers: Record<string, any>;
  sectionScores: Record<string, { score: number; total: number }>;
}

interface CertificateData {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  score: number;
  completedModules: number;
  completedAt: string;
  generatedAt: string;
  examId?: number;
  certificateNumber?: string;
}

interface CertificateSettings {
  id?: number;
  title: string;
  subtitle: string;
  description: string;
  cefr_level: string;
  institution_name: string;
  institution_subtitle: string;
  signatory_name: string;
  signatory_title: string;
  auto_generate: boolean;
  email_delivery: boolean;
  template: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminExamPage() {
  const router = useRouter();
  const [examTemplates, setExamTemplates] = useState<ExamTemplate[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [generatedCertificates, setGeneratedCertificates] = useState<CertificateData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ExamTemplate | null>(null);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [certificateSettings, setCertificateSettings] = useState<CertificateSettings>({
    title: "Certificate of Achievement",
    subtitle: "Estonian Language Proficiency",
    description:
      "This is to certify that {studentName} has successfully completed the Eesti Seiklus Estonian language course and demonstrated proficiency at the {cefrLevel} level of the Common European Framework of Reference for Languages (CEFR).",
    cefr_level: "A1-A2",
    institution_name: "Eesti Seiklus Language Academy",
    institution_subtitle: "Estonian Adventure Learning Platform",
    signatory_name: "Dr. Estonian Teacher",
    signatory_title: "Director of Estonian Studies",
    auto_generate: true,
    email_delivery: false,
    template: "default",
  });

  useEffect(() => {
    const loadAllExamData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [templatesRes, resultsRes, certificatesRes, certSettingsRes] = await Promise.all([
          fetch('/api/exam-templates', { cache: 'no-store' }),
          fetch('/api/exam-results', { cache: 'no-store' }),
          fetch('/api/certificates', { cache: 'no-store' }),
          fetch('/api/certificate-settings', { cache: 'no-store' }),
        ]);

        if (!templatesRes.ok)
          throw new Error(`Failed to fetch exam templates: ${(await templatesRes.json()).error || templatesRes.statusText}`);
        const fetchedTemplates: ExamTemplate[] = await templatesRes.json();
        setExamTemplates(fetchedTemplates);

        if (!resultsRes.ok)
          throw new Error(`Failed to fetch exam results: ${(await resultsRes.json()).error || resultsRes.statusText}`);
        const fetchedResults: ExamResult[] = await resultsRes.json();
        setExamResults(fetchedResults);

        if (!certificatesRes.ok)
          throw new Error(
            `Failed to fetch certificates: ${(await certificatesRes.json()).error || certificatesRes.statusText}`,
          );
        const fetchedCertificates: CertificateData[] = await certificatesRes.json();
        setGeneratedCertificates(fetchedCertificates);

        if (!certSettingsRes.ok)
          throw new Error(
            `Failed to fetch certificate settings: ${(await certSettingsRes.json()).error || certSettingsRes.statusText}`,
          );
        const fetchedCertSettings: CertificateSettings = await certSettingsRes.json();
        setCertificateSettings(fetchedCertSettings);
      } catch (err: any) {
        console.error("Error loading exam page data:", err);
        setError(err.message || "An unexpected error occurred while loading exam data.");
        setExamTemplates([]);
        setExamResults([]);
        setGeneratedCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllExamData();
  }, []);

  // --- Exam Template Actions ---
  const createNewTemplate = () => {
    router.push("/admin/exam/new");
  };

  const saveTemplate = async (template: ExamTemplate) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/exam-templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error(`Failed to save template: ${(await response.json()).error || response.statusText}`);
      toast.success("Exam template saved successfully!");
      const updatedTemplate = await response.json();
      setExamTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)),
      );
      setSelectedTemplate(updatedTemplate);
    } catch (err: any) {
      console.error("Error saving template:", err);
      toast.error(`Failed to save template: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const duplicateTemplate = async (template: ExamTemplate) => {
    toast.info("Duplicating exam template...");
    try {
      const duplicatedTemplateData = {
        ...template,
        id: undefined,
        title: `${template.title} (Copy)`,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const response = await fetch("/api/exam-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicatedTemplateData),
      });
      if (!response.ok) throw new Error(`Failed to duplicate template: ${(await response.json()).error || response.statusText}`);
      toast.success("Template duplicated successfully!");
      const newTemplate = await response.json();
      setExamTemplates((prev) => [...prev, newTemplate]);
    } catch (err: any) {
      console.error("Error duplicating template:", err);
      toast.error(`Failed to duplicate template: ${err.message}`);
    }
  };

  const deleteTemplate = async (templateId: number) => {
    toast.info("Deleting exam template...");
    try {
      const response = await fetch(`/api/exam-templates/${templateId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Failed to delete template: ${(await response.json()).error || response.statusText}`);
      toast.success("Template deleted successfully!");
      setExamTemplates((prev) => prev.filter((t) => t.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error("Error deleting template:", err);
      toast.error(`Failed to delete template: ${err.message}`);
    }
  };

  const publishTemplate = async (templateId: number) => {
    const templateToPublish = examTemplates.find((t) => t.id === templateId);
    if (!templateToPublish) return;

    const newPublishedStatus = !templateToPublish.isPublished;
    const actionText = newPublishedStatus ? "Publishing" : "Unpublishing";
    toast.info(`${actionText} exam template...`);

    try {
      const response = await fetch(`/api/exam-templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: newPublishedStatus }),
      });
      if (!response.ok) throw new Error(`Failed to ${actionText.toLowerCase()} template: ${(await response.json()).error || response.statusText}`);
      toast.success(`Exam template ${newPublishedStatus ? "published" : "unpublished"} successfully!`);
      setExamTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId ? { ...t, isPublished: newPublishedStatus } : t,
        ),
      );
    } catch (err: any) {
      console.error(`Error ${actionText.toLowerCase()} template:`, err);
      toast.error(`Failed to ${actionText.toLowerCase()} template: ${err.message}`);
    }
  };

  const addSection = () => {
    if (!selectedTemplate) return;
    const newSection: ExamSection = {
      id: Date.now(),
      exam_template_id: selectedTemplate.id,
      title: `Section ${selectedTemplate.sections.length + 1}`,
      max_points: 0,
      questions: [],
      randomize_questions: false,
    };
    setSelectedTemplate({
      ...selectedTemplate,
      sections: [...selectedTemplate.sections, newSection],
    });
  };

  const updateSection = (sectionIndex: number, updates: Partial<ExamSection>) => {
    if (!selectedTemplate) return;
    const updatedSections = [...selectedTemplate.sections];
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], ...updates };
    setSelectedTemplate({ ...selectedTemplate, sections: updatedSections });
  };

  const deleteSection = (sectionIndex: number) => {
    if (!selectedTemplate) return;
    setSelectedTemplate({
      ...selectedTemplate,
      sections: selectedTemplate.sections.filter((_, i) => i !== sectionIndex),
    });
  };

  const addQuestion = (sectionIndex: number) => {
    if (!selectedTemplate) return;
    const newQuestion: ExamQuestion = {
      id: Date.now(),
      type: "multiple-choice",
      question: "New Question",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correct_answer: 0,
      points: 1,
      difficulty: "easy",
      tags: [],
    };
    const updatedSections = [...selectedTemplate.sections];
    updatedSections[sectionIndex].questions.push(newQuestion);
    setSelectedTemplate({ ...selectedTemplate, sections: updatedSections });
  };

  const updateQuestion = (
    sectionIndex: number,
    questionIndex: number,
    updates: Partial<ExamQuestion>,
  ) => {
    if (!selectedTemplate) return;
    const updatedSections = [...selectedTemplate.sections];
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...updatedSections[sectionIndex].questions[questionIndex],
      ...updates,
    };
    setSelectedTemplate({ ...selectedTemplate, sections: updatedSections });
  };

  const deleteQuestion = (sectionIndex: number, questionIndex: number) => {
    if (!selectedTemplate) return;
    const updatedSections = [...selectedTemplate.sections];
    updatedSections[sectionIndex].questions = updatedSections[sectionIndex].questions.filter(
      (_, i) => i !== questionIndex,
    );
    setSelectedTemplate({ ...selectedTemplate, sections: updatedSections });
  };

  const duplicateQuestion = (sectionId: number, questionId: number) => {
    if (!selectedTemplate) return;
    const sectionIndex = selectedTemplate.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) return;
    const questionIndex = selectedTemplate.sections[sectionIndex].questions.findIndex(
      (q) => q.id === questionId,
    );
    if (questionIndex === -1) return;
    const question = selectedTemplate.sections[sectionIndex].questions[questionIndex];
    const newQuestion: ExamQuestion = {
      ...question,
      id: Date.now(),
    };
    const updatedSections = [...selectedTemplate.sections];
    updatedSections[sectionIndex].questions.push(newQuestion);
    setSelectedTemplate({ ...selectedTemplate, sections: updatedSections });
  };

  const previewExam = () => {
    if (!selectedTemplate) return;
    const previewHTML = `
      <html>
        <body>
          <h1>${selectedTemplate.title}</h1>
          <p>${selectedTemplate.description}</p>
          ${selectedTemplate.sections
            .map(
              (section, i) => `
                <h2>Section ${i + 1}: ${section.title}</h2>
                ${section.questions
                  .map(
                    (q, j) => `
                      <div>
                        <strong>Question ${j + 1}: ${q.question}</strong>
                        <p>Type: ${q.type}</p>
                        <p>Points: ${q.points}</p>
                        ${q.options ? `<p>Options: ${q.options.join(", ")}</p>` : ""}
                      </div>
                    `,
                  )
                  .join("")}
              `,
            )
            .join("")}
        </body>
      </html>
    `;
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(previewHTML);
      newWindow.document.close();
    }
  };

  const saveExam = async (publish: boolean) => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/exam-templates/${selectedTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...selectedTemplate, isPublished: publish }),
      });
      if (!response.ok) throw new Error(`Failed to save exam: ${(await response.json()).error || response.statusText}`);
      toast.success(publish ? "Exam published successfully!" : "Exam saved as draft!");
      const updatedTemplate = await response.json();
      setExamTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)),
      );
      setSelectedTemplate(updatedTemplate);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error saving exam:", err);
      toast.error(`Failed to save exam: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const generateCertificate = async (result: ExamResult) => {
    toast.info(`Generating certificate for ${result.studentName}...`);
    try {
      const studentRes = await fetch(`/api/students/${result.studentId}`);
      if (!studentRes.ok)
        throw new Error(`Failed to fetch student data: ${(await studentRes.json()).error || studentRes.statusText}`);
      const studentData = await studentRes.json();
      const studentCompletedModulesCount = studentData.completedModules?.length || 0;

      const certDataToSend = {
        studentId: result.studentId,
        examId: result.examId,
        score: result.percentage,
        completedModules: studentCompletedModulesCount,
        completedAt: result.completedAt,
        generatedAt: new Date().toISOString(),
        certificateNumber: `EST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      };

      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(certDataToSend),
      });

      if (!response.ok)
        throw new Error(`Failed to generate certificate: ${(await response.json()).error || response.statusText}`);
      const newCert = await response.json();
      toast.success(`Certificate generated for ${result.studentName}!`);
      setGeneratedCertificates((prev) => [...prev, newCert]);
      return newCert;
    } catch (err: any) {
      console.error("Error generating certificate:", err);
      toast.error(`Failed to generate certificate: ${err.message}`);
      return null;
    }
  };

  const downloadCertificate = (certificate: CertificateData) => {
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${certificateSettings.title}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 800px;
            width: 100%;
            position: relative;
          }
          .header { text-align: center; margin-bottom: 40px; }
          .title {
            font-size: 48px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .subtitle {
            font-size: 24px;
            color: #6b7280;
            margin-bottom: 20px;
          }
          .content { text-align: center; margin: 40px 0; }
          .student-name {
            font-size: 36px;
            font-weight: bold;
            color: #1f2937;
            margin: 20px 0;
            border-bottom: 3px solid #2563eb;
            display: inline-block;
            padding-bottom: 10px;
          }
          .achievement {
            font-size: 18px;
            color: #374151;
            margin: 20px 0;
            line-height: 1.8;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
          .details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 40px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 10px;
          }
          .detail-item { text-align: center; }
          .detail-value {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            display: block;
          }
          .detail-label {
            font-size: 14px;
            color: #6b7280;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
          }
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin: 30px 0;
          }
          .signature {
            text-align: center;
            padding: 20px;
          }
          .signature-line {
            border-top: 2px solid #374151;
            margin-bottom: 10px;
            width: 200px;
            margin-left: auto;
            margin-right: auto;
          }
          .signature-name {
            font-weight: bold;
            font-size: 16px;
            color: #1f2937;
          }
          .signature-title {
            font-size: 14px;
            color: #6b7280;
            margin-top: 5px;
          }
          .date {
            color: #6b7280;
            font-size: 16px;
            margin-top: 20px;
          }
          .certificate-number {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 12px;
            color: #6b7280;
          }
          @media print {
            body { background: white; padding: 0; }
            .certificate { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="certificate-number">Certificate No: ${certificate.certificateNumber}</div>
          <div class="header">
            <div class="title">${certificateSettings.title}</div>
            <div class="subtitle">${certificateSettings.subtitle}</div>
          </div>
          <div class="content">
            <div style="font-size: 20px; margin-bottom: 20px;">This is to certify that</div>
            <div class="student-name">${certificate.studentName}</div>
            <div class="achievement">
              ${certificateSettings.description
                .replace("{studentName}", certificate.studentName)
                .replace("{cefrLevel}", certificateSettings.cefr_level)}
            </div>
            <div class="details">
              <div class="detail-item">
                <span class="detail-value">${certificate.score}%</span>
                <div class="detail-label">Final Score</div>
              </div>
              <div class="detail-item">
                <span class="detail-value">${certificate.completedModules}</span>
                <div class="detail-label">Modules Completed</div>
              </div>
              <div class="detail-item">
                <span class="detail-value">${certificateSettings.cefr_level}</span>
                <div class="detail-label">CEFR Level</div>
              </div>
            </div>
          </div>
          <div class="footer">
            <div class="signature-section">
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-name">${certificateSettings.signatory_name}</div>
                <div class="signature-title">${certificateSettings.signatory_title}</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-name">${certificateSettings.institution_name}</div>
                <div class="signature-title">${certificateSettings.institution_subtitle}</div>
              </div>
            </div>
            <div class="date">
              Issued on ${new Date(certificate.completedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(certificateHTML);
      newWindow.document.close();
    }
  };

  const sendCertificateEmail = async (certificate: CertificateData) => {
    toast.info(`Sending certificate email to ${certificate.studentEmail}...`);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: [certificate.studentEmail],
          subject: certificateSettings.title,
          content: `${certificateSettings.description
            .replace("{studentName}", certificate.studentName)
            .replace("{cefrLevel}", certificateSettings.cefr_level)}
          \n\nYour certificate number is: ${certificate.certificateNumber}`,
          priority: "normal",
          personalizeContent: true,
          selectedTemplate: certificateSettings.template,
        }),
      });
      if (!response.ok)
        throw new Error(`Failed to send certificate email: ${(await response.json()).error || response.statusText}`);
      toast.success(`Certificate email sent to ${certificate.studentName}!`);
    } catch (err: any) {
      console.error("Error sending certificate email:", err);
      toast.error(`Failed to send certificate email: ${err.message}`);
    }
  };

  const exportResults = () => {
    const csvContent = [
      ["Student Name", "Email", "Score", "Total Points", "Percentage", "Passed", "Completed At", "Time Spent (min)"],
      ...examResults.map((result) => [
        result.studentName,
        result.studentEmail,
        result.score.toString(),
        result.totalPoints.toString(),
        `${result.percentage}%`,
        result.passed ? "Yes" : "No",
        new Date(result.completedAt).toLocaleDateString(),
        Math.round(result.timeSpent / 60).toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-results.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exam results exported successfully!");
  };

const saveCertificateSettings = async () => {
  setSaving(true);
  try {
    const response = await fetch("/api/certificate-settings", {
      method: certificateSettings.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(certificateSettings),
    });
    let errorMessage = response.statusText || "An error occurred";
    if (!response.ok) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (jsonError) {
        console.warn("Failed to parse error response:", jsonError);
      }
      throw new Error(`Failed to save certificate settings: ${errorMessage}`);
    }
    const updatedSettings = await response.json();
    toast.success("Certificate settings saved successfully!");
    setCertificateSettings(updatedSettings.settings || updatedSettings);
  } catch (err: any) {
    console.error("Error saving certificate settings:", err);
    toast.error(`Failed to save certificate settings: ${err.message}`);
  } finally {
    setSaving(false);
  }
};

  const getExamStats = () => {
    const totalExams = examTemplates.length;
    const publishedExams = examTemplates.filter((t) => t.isPublished).length;
    const totalResults = examResults.length;
    const averageScore =
      examResults.length > 0
        ? Math.round(examResults.reduce((sum, result) => sum + result.percentage, 0) / examResults.length)
        : 0;
    const passRate =
      examResults.length > 0 ? Math.round((examResults.filter((r) => r.passed).length / examResults.length) * 100) : 0;

    return { totalExams, publishedExams, totalResults, averageScore, passRate };
  };

  const stats = getExamStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Exam Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Exam Management
          </h1>
          <p className="text-gray-600">Create, manage, and monitor Estonian language proficiency exams</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Exams</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalExams}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Published</p>
                      <p className="text-2xl font-bold text-green-600">{stats.publishedExams}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Submissions</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.totalResults}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Score</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.averageScore}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pass Rate</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.passRate}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="templates">Exam Templates</TabsTrigger>
                <TabsTrigger value="results">Results & Analytics</TabsTrigger>
                <TabsTrigger value="certificates">Certificate Management</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Exam Templates</h2>
                  <Button onClick={createNewTemplate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Exam
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {examTemplates.map((template) => (
                    <Card key={template.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {template.title}
                              {template.isPublished && <Badge className="bg-green-100 text-green-800">Published</Badge>}
                            </CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{template.sections.length}</div>
                            <div className="text-sm text-gray-600">Sections</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">{template.totalPoints}</div>
                            <div className="text-sm text-gray-600">Points</div>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsEditing(false);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsEditing(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </Button>
                          <Button
                            size="sm"
                            variant={template.isPublished ? "destructive" : "default"}
                            onClick={() => publishTemplate(template.id)}
                          >
                            {template.isPublished ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Publish
                              </>
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Exam Template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{template.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteTemplate(template.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {examTemplates.length === 0 && (
                    <Card className="text-center p-8">
                      <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Exam Templates</h3>
                      <p className="text-gray-600 mb-4">Create your first exam template to get started.</p>
                      <Button onClick={createNewTemplate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Exam Template
                      </Button>
                    </Card>
                  )}
                </div>

                {selectedTemplate && (
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {isEditing ? "Edit Exam Template" : "View Exam Template"}
                        {isEditing && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTemplate(null);
                                setIsEditing(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => saveTemplate(selectedTemplate)} disabled={saving}>
                              {saving ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save"
                              )}
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Exam Title</Label>
                          <Input
                            id="title"
                            value={selectedTemplate.title}
                            onChange={(e) =>
                              setSelectedTemplate({ ...selectedTemplate, title: e.target.value })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={selectedTemplate.description}
                            onChange={(e) =>
                              setSelectedTemplate({ ...selectedTemplate, description: e.target.value })
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                            <Input
                              id="timeLimit"
                              type="number"
                              min="30"
                              max="300"
                              value={selectedTemplate.timeLimit}
                              onChange={(e) =>
                                setSelectedTemplate({
                                  ...selectedTemplate,
                                  timeLimit: parseInt(e.target.value) || 120,
                                })
                              }
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label htmlFor="passingScore">Passing Score (%)</Label>
                            <Input
                              id="passingScore"
                              type="number"
                              min="50"
                              max="100"
                              value={selectedTemplate.settings.passingScore}
                              onChange={(e) =>
                                setSelectedTemplate({
                                  ...selectedTemplate,
                                  settings: {
                                    ...selectedTemplate.settings,
                                    passingScore: parseInt(e.target.value) || 70,
                                  },
                                })
                              }
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Sections</h3>
                          {isEditing && (
                            <Button size="sm" onClick={addSection}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Section
                            </Button>
                          )}
                        </div>

                        {selectedTemplate.sections.map((section, sectionIndex) => (
                          <Card key={section.id} className="border">
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  {isEditing ? (
                                    <Input
                                      value={section.title}
                                      onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                                      className="font-semibold"
                                    />
                                  ) : (
                                    <CardTitle className="text-base">{section.title}</CardTitle>
                                  )}
                                </div>
                                {isEditing && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteSection(sectionIndex)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium">Questions ({section.questions.length})</h4>
                                  {isEditing && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addQuestion(sectionIndex)}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Question
                                    </Button>
                                  )}
                                </div>

                                {section.questions.map((question, questionIndex) => (
                                  <Card key={question.id} className="border-l-4 border-l-blue-500">
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1 space-y-3">
                                          {isEditing ? (
                                            <>
                                              <div className="grid grid-cols-2 gap-2">
                                                <Select
                                                  value={question.type}
                                                  onValueChange={(value: any) =>
                                                    updateQuestion(sectionIndex, questionIndex, { type: value })
                                                  }
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                                    <SelectItem value="true-false">True/False</SelectItem>
                                                    <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                                                    <SelectItem value="short-answer">Short Answer</SelectItem>
                                                    <SelectItem value="essay">Essay</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                                <Input
                                                  type="number"
                                                  placeholder="Points"
                                                  value={question.points}
                                                  onChange={(e) =>
                                                    updateQuestion(sectionIndex, questionIndex, {
                                                      points: parseInt(e.target.value) || 1,
                                                    })
                                                  }
                                                />
                                              </div>
                                              <Textarea
                                                placeholder="Question text"
                                                value={question.question}
                                                onChange={(e) =>
                                                  updateQuestion(sectionIndex, questionIndex, {
                                                    question: e.target.value,
                                                  })
                                                }
                                                rows={2}
                                              />
                                            </>
                                          ) : (
                                            <>
                                              <div className="flex justify-between items-center">
                                                <Badge variant="outline">{question.type}</Badge>
                                                <Badge>{question.points} points</Badge>
                                              </div>
                                              <p className="font-medium">{question.question}</p>
                                            </>
                                          )}

                                          {question.type === "multiple-choice" && (
                                            <div className="space-y-2">
                                              <Label>Answer Options</Label>
                                              {question.options?.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex gap-2">
                                                  {isEditing ? (
                                                    <Input
                                                      value={option}
                                                      onChange={(e) => {
                                                        const newOptions = [...(question.options || [])];
                                                        newOptions[optionIndex] = e.target.value;
                                                        updateQuestion(sectionIndex, questionIndex, {
                                                          options: newOptions,
                                                        });
                                                      }}
                                                    />
                                                  ) : (
                                                    <span
                                                      className={`p-2 rounded ${
                                                        question.correct_answer === optionIndex
                                                          ? "bg-green-100 text-green-800 font-medium"
                                                          : "bg-gray-100"
                                                      }`}
                                                    >
                                                      {option}
                                                    </span>
                                                  )}
                                                  {isEditing && (
                                                    <Button
                                                      variant={
                                                        question.correct_answer === optionIndex
                                                          ? "default"
                                                          : "outline"
                                                      }
                                                      size="sm"
                                                      onClick={() =>
                                                        updateQuestion(sectionIndex, questionIndex, {
                                                          correct_answer: optionIndex,
                                                        })
                                                      }
                                                    >
                                                      Correct
                                                    </Button>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {(question.type === "fill-blank" || question.type === "short-answer") && (
                                            <div className="space-y-2">
                                              <Label>Correct Answer</Label>
                                              <Input
                                                value={question.correct_answer as string}
                                                onChange={(e) =>
                                                  updateQuestion(sectionIndex, questionIndex, {
                                                    correct_answer: e.target.value,
                                                  })
                                                }
                                                placeholder="Enter the correct answer"
                                                disabled={!isEditing}
                                              />
                                            </div>
                                          )}

                                          {question.type === "true-false" && (
                                            <div className="space-y-2">
                                              <Label>Correct Answer</Label>
                                              <div className="flex gap-2">
                                                <Button
                                                  variant={question.correct_answer === true ? "default" : "outline"}
                                                  size="sm"
                                                  onClick={() =>
                                                    updateQuestion(sectionIndex, questionIndex, {
                                                      correct_answer: true,
                                                    })
                                                  }
                                                  disabled={!isEditing}
                                                >
                                                  True
                                                </Button>
                                                <Button
                                                  variant={question.correct_answer === false ? "default" : "outline"}
                                                  size="sm"
                                                  onClick={() =>
                                                    updateQuestion(sectionIndex, questionIndex, {
                                                      correct_answer: false,
                                                    })
                                                  }
                                                  disabled={!isEditing}
                                                >
                                                  False
                                                </Button>
                                              </div>
                                            </div>
                                          )}

                                          {isEditing && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                              <div className="space-y-2">
                                                <Label>Difficulty</Label>
                                                <Select
                                                  value={question.difficulty}
                                                  onValueChange={(value: "easy" | "medium" | "hard") =>
                                                    updateQuestion(sectionIndex, questionIndex, {
                                                      difficulty: value,
                                                    })
                                                  }
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="easy">Easy</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="hard">Hard</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Module</Label>
                                                <Input
                                                  value={question.module_id || ""}
                                                  onChange={(e) =>
                                                    updateQuestion(sectionIndex, questionIndex, {
                                                      module_id: parseInt(e.target.value) || undefined,
                                                    })
                                                  }
                                                  placeholder="e.g., Module 12 ID"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Tags</Label>
                                                <Input
                                                  value={question.tags.join(", ")}
                                                  onChange={(e) =>
                                                    updateQuestion(sectionIndex, questionIndex, {
                                                      tags: e.target.value
                                                        .split(",")
                                                        .map((tag) => tag.trim())
                                                        .filter((tag) => tag),
                                                    })
                                                  }
                                                  placeholder="grammar, vocabulary"
                                                />
                                              </div>
                                            </div>
                                          )}

                                          {(question.hint || isEditing) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label>Hint (optional)</Label>
                                                <Textarea
                                                  value={question.hint || ""}
                                                  onChange={(e) =>
                                                    updateQuestion(sectionIndex, questionIndex, {
                                                      hint: e.target.value,
                                                    })
                                                  }
                                                  placeholder="Provide a helpful hint"
                                                  rows={2}
                                                  disabled={!isEditing}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Explanation (optional)</Label>
                                                <Textarea
                                                  value={question.explanation || ""}
                                                  onChange={(e) =>
                                                    updateQuestion(sectionIndex, questionIndex, {
                                                      explanation: e.target.value,
                                                    })
                                                  }
                                                  placeholder="Explain the correct answer"
                                                  rows={2}
                                                  disabled={!isEditing}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          {isEditing && (
                                            <>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => duplicateQuestion(section.id, question.id)}
                                              >
                                                <Copy className="w-3 h-3" />
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => deleteQuestion(sectionIndex, questionIndex)}
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Exam Results</h2>
                  <Button onClick={exportResults} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </Button>
                </div>

                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Recent Results</CardTitle>
                    <CardDescription>View student performance and generate certificates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {examResults.map((result) => (
                        <Card key={result.id} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{result.studentName}</div>
                              <div className="text-sm text-gray-600">
                                {result.studentEmail} • {new Date(result.completedAt).toLocaleDateString()} • Attempt{" "}
                                {result.attemptNumber}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{result.percentage}%</div>
                              <div className="text-sm text-gray-600">{result.passed ? "Passed" : "Failed"}</div>
                            </div>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedResult(result)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            {result.passed && (
                              <Button size="sm" onClick={() => generateCertificate(result)}>
                                <Award className="w-4 h-4 mr-2" />
                                Generate Certificate
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                      {examResults.length === 0 && (
                        <p className="text-center text-gray-600">No exam results available.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {selectedResult && (
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Result Details: {selectedResult.studentName}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="font-bold">{selectedResult.score}/{selectedResult.totalPoints}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Percentage</p>
                          <p className="font-bold">{selectedResult.percentage}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Time Spent</p>
                          <p className="font-bold">{Math.round(selectedResult.timeSpent / 60)} min</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="font-bold">
                            {new Date(selectedResult.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">Section Scores</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedResult.sectionScores).map(([section, { score, total }]) => (
                            <div key={section} className="flex justify-between">
                              <span>{section}</span>
                              <span className="font-bold">{score}/{total}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="certificates" className="space-y-6">
                <h2 className="text-2xl font-semibold">Certificate Management</h2>
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Generated Certificates</CardTitle>
                    <CardDescription>Manage and distribute student certificates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedCertificates.map((certificate) => (
                        <Card key={certificate.id} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{certificate.studentName}</div>
                              <div className="text-sm text-gray-600">
                                {certificate.studentEmail} • Issued{" "}
                                {new Date(certificate.generatedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadCertificate(certificate)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => sendCertificateEmail(certificate)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Send Email
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {generatedCertificates.length === 0 && (
                        <p className="text-center text-gray-600">No certificates generated.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Exam & Certificate Settings
                    </CardTitle>
                    <CardDescription>Configure exam behavior and certificate details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedTemplate && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Exam Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-medium">Question Settings</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="randomizeQuestions">Randomize Questions</Label>
                                <Switch
                                  id="randomizeQuestions"
                                  checked={selectedTemplate.settings.randomizeQuestions}
                                  onCheckedChange={(checked) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: { ...selectedTemplate.settings, randomizeQuestions: checked },
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="randomizeSections">Randomize Sections</Label>
                                <Switch
                                  id="randomizeSections"
                                  checked={selectedTemplate.settings.randomizeSections}
                                  onCheckedChange={(checked) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: { ...selectedTemplate.settings, randomizeSections: checked },
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="showQuestionNumbers">Show Question Numbers</Label>
                                <Switch
                                  id="showQuestionNumbers"
                                  checked={selectedTemplate.settings.showQuestionNumbers}
                                  onCheckedChange={(checked) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: { ...selectedTemplate.settings, showQuestionNumbers: checked },
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium">Navigation Settings</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="showProgressBar">Show Progress Bar</Label>
                                <Switch
                                  id="showProgressBar"
                                  checked={selectedTemplate.settings.showProgressBar}
                                  onCheckedChange={(checked) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: { ...selectedTemplate.settings, showProgressBar: checked },
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="allowBackNavigation">Allow Back Navigation</Label>
                                <Switch
                                  id="allowBackNavigation"
                                  checked={selectedTemplate.settings.allowBackNavigation}
                                  onCheckedChange={(checked) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: { ...selectedTemplate.settings, allowBackNavigation: checked },
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="autoSave">Auto-save Progress</Label>
                                <Switch
                                  id="autoSave"
                                  checked={selectedTemplate.settings.autoSave}
                                  onCheckedChange={(checked) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: { ...selectedTemplate.settings, autoSave: checked },
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium">Security Settings</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="preventCheating">Prevent Cheating</Label>
                                <Switch
                                  id="preventCheating"
                                  checked={selectedTemplate.settings.preventCheating}
                                  onCheckedChange={(checked) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: { ...selectedTemplate.settings, preventCheating: checked },
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="fullScreenMode">Full Screen Mode</Label>
                                <Switch
                                  id="fullScreenMode"
                                  checked={selectedTemplate.settings.fullScreenMode}
                                  onCheckedChange={(checked) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: { ...selectedTemplate.settings, fullScreenMode: checked },
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium">Scoring Settings</h4>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor="passingScore">Passing Score (%)</Label>
                                <Input
                                  id="passingScore"
                                  type="number"
                                  min="50"
                                  max="100"
                                  value={selectedTemplate.settings.passingScore}
                                  onChange={(e) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: {
                                        ...selectedTemplate.settings,
                                        passingScore: parseInt(e.target.value) || 70,
                                      },
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                                <Input
                                  id="maxAttempts"
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={selectedTemplate.settings.maxAttempts}
                                  onChange={(e) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: {
                                        ...selectedTemplate.settings,
                                        maxAttempts: parseInt(e.target.value) || 3,
                                      },
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="showResultsImmediately">Show Results Immediately</Label>
                                <Switch
                                  id="showResultsImmediately"
                                  checked={selectedTemplate.settings.showResultsImmediately}
                                  onCheckedChange={(checked) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: {
                                        ...selectedTemplate.settings,
                                        showResultsImmediately: checked,
                                      },
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="certificateEnabled">Enable Certificates</Label>
                                <Switch
                                  id="certificateEnabled"
                                  checked={selectedTemplate.settings.certificateEnabled}
                                  onCheckedChange={(checked) =>
                                    setSelectedTemplate({
                                      ...selectedTemplate,
                                      settings: {
                                        ...selectedTemplate.settings,
                                        certificateEnabled: checked,
                                      },
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Certificate Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="certTitle">Certificate Title</Label>
                          <Input
                            id="certTitle"
                            value={certificateSettings.title}
                            onChange={(e) =>
                              setCertificateSettings({ ...certificateSettings, title: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="certSubtitle">Subtitle</Label>
                          <Input
                            id="certSubtitle"
                            value={certificateSettings.subtitle}
                            onChange={(e) =>
                              setCertificateSettings({ ...certificateSettings, subtitle: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="certDescription">Description</Label>
                          <Textarea
                            id="certDescription"
                            value={certificateSettings.description}
                            onChange={(e) =>
                              setCertificateSettings({ ...certificateSettings, description: e.target.value })
                            }
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cefrLevel">CEFR Level</Label>
                          <Select
                            value={certificateSettings.cefr_level}
                            onValueChange={(value) =>
                              setCertificateSettings({ ...certificateSettings, cefr_level: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A1">A1</SelectItem>
                              <SelectItem value="A2">A2</SelectItem>
                              <SelectItem value="B1">B1</SelectItem>
                              <SelectItem value="B2">B2</SelectItem>
                              <SelectItem value="C1">C1</SelectItem>
                              <SelectItem value="C2">C2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="institutionName">Institution Name</Label>
                            <Input
                              id="institutionName"
                              value={certificateSettings.institution_name}
                              onChange={(e) =>
                                setCertificateSettings({
                                  ...certificateSettings,
                                  institution_name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="institutionSubtitle">Institution Subtitle</Label>
                            <Input
                              id="institutionSubtitle"
                              value={certificateSettings.institution_subtitle}
                              onChange={(e) =>
                                setCertificateSettings({
                                  ...certificateSettings,
                                  institution_subtitle: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="signatoryName">Signatory Name</Label>
                            <Input
                              id="signatoryName"
                              value={certificateSettings.signatory_name}
                              onChange={(e) =>
                                setCertificateSettings({
                                  ...certificateSettings,
                                  signatory_name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="signatoryTitle">Signatory Title</Label>
                            <Input
                              id="signatoryTitle"
                              value={certificateSettings.signatory_title}
                              onChange={(e) =>
                                setCertificateSettings({
                                  ...certificateSettings,
                                  signatory_title: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="autoGenerate">Auto-generate Certificates</Label>
                          <Switch
                            id="autoGenerate"
                            checked={certificateSettings.auto_generate}
                            onCheckedChange={(checked) =>
                              setCertificateSettings({ ...certificateSettings, auto_generate: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="emailDelivery">Enable Email Delivery</Label>
                          <Switch
                            id="emailDelivery"
                            checked={certificateSettings.email_delivery}
                            onCheckedChange={(checked) =>
                              setCertificateSettings({ ...certificateSettings, email_delivery: checked })
                            }
                          />
                        </div>
                      </div>
                      <Button onClick={saveCertificateSettings} disabled={saving}>
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Certificate Settings"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Exam Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Title</span>
                  <span className="font-medium text-right">{selectedTemplate?.title || "Select a template"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sections</span>
                  <span className="font-medium">{selectedTemplate?.sections.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Questions</span>
                  <span className="font-medium">
                    {selectedTemplate?.sections.reduce((total, section) => total + section.questions.length, 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Points</span>
                  <span className="font-medium">{selectedTemplate?.totalPoints || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time Limit</span>
                  <span className="font-medium">{selectedTemplate?.timeLimit || 0} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Passing Score</span>
                  <span className="font-medium">{selectedTemplate?.settings.passingScore || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={previewExam}
                  disabled={!selectedTemplate}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Exam
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => saveExam(false)}
                  disabled={saving || !selectedTemplate}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  onClick={() => saveExam(true)}
                  disabled={saving || !selectedTemplate}
                  className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publish Exam
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

         
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
  <CardHeader>
    <CardTitle className="text-lg">Exam Building Tips</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3 text-sm">
    <div className="flex items-start gap-2">
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
      <p>Start with basic information and add sections progressively to organize content effectively.</p>
    </div>
    <div className="flex items-start gap-2">
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
      <p>Use a mix of question types (e.g., multiple-choice, true/false) to assess different skills.</p>
    </div>
    <div className="flex items-start gap-2">
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
      <p>Ensure questions align with the CEFR level and learning objectives.</p>
    </div>
    <div className="flex items-start gap-2">
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
      <p>Preview and test your exam to verify clarity and functionality before publishing.</p>
    </div>
  </CardContent>
</Card>
  </div>
        </div>
      </div>
    </div>
  );
}
