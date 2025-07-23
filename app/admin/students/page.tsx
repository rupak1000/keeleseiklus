// app/admin/students/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Download,
  BookOpen,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Crown,
  Settings,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  email: string;
  level: string;
  enrollmentDate: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
  examStatus?: 'not_taken' | 'passed' | 'failed';
  examScore?: number;
  examAttempts?: number;
  subscription?: string;
  subscriptionStatus?: 'free' | 'premium' | 'admin_override';
  subscriptionDate?: string;
  progress: number; // Computed client-side
}

interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
  passed: boolean;
  attempt: number;
}

interface SubscriptionSettings {
  enabled: boolean;
  freeModuleLimit: number;
  premiumRequired: boolean;
}

interface StudentModule {
  studentId: string;
  moduleIds: number[];
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [studentModules, setStudentModules] = useState<StudentModule[]>([]); // Added state for studentModules
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings>({
    enabled: true,
    freeModuleLimit: 10,
    premiumRequired: true,
  });
  const [totalModules, setTotalModules] = useState(40); // Default value, updated by /api/modules

  // Load data on component mount
  useEffect(() => {
    loadStudents();
    loadExamResults();
    loadSubscriptionSettings();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const [studentsResponse, modulesResponse] = await Promise.all([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/modules', { cache: 'no-store' }),
      ]);
      if (!studentsResponse.ok) {
        const errorData = await studentsResponse.json();
        throw new Error(`Failed to fetch students: ${errorData.error || studentsResponse.statusText}`);
      }
      if (!modulesResponse.ok) {
        console.warn('Failed to fetch modules, using default totalModules=40');
        // Don't throw error, proceed with default totalModules
      }
      const studentsData = await studentsResponse.json();
      const modulesData = await modulesResponse.ok ? await modulesResponse.json() : [];
      setTotalModules(modulesData.length || 40);

      const studentModulesData = await Promise.all(
        studentsData.map(async (student: any) => {
          const response = await fetch(`/api/student-modules?studentId=${student.id}`, { cache: 'no-store' });
          if (!response.ok) return { studentId: student.id, moduleIds: [] };
          const data = await response.json();
          return { studentId: student.id, moduleIds: data.map((m: any) => m.module_id) };
        }),
      );
      setStudentModules(studentModulesData);

      const transformedStudents: Student[] = studentsData.map((student: any) => {
        const completedModules = studentModulesData.find((sm) => sm.studentId === student.id)?.moduleIds || [];
        const progress = modulesData.length > 0 ? Math.round((completedModules.length / modulesData.length) * 100) : 0;
        return {
          id: student.id,
          name: student.name || '',
          email: student.email || '',
          level: student.level || 'A1',
          enrollmentDate: student.enrollment_date ? new Date(student.enrollment_date).toISOString().split('T')[0] : '',
          lastActive: student.last_active ? new Date(student.last_active).toISOString().split('T')[0] : '',
          status: student.status || 'active',
          examStatus: student.exam_status || 'not_taken',
          examScore: student.exam_score || 0,
          examAttempts: student.exam_attempts || 0,
          subscription: student.subscription || 'Free',
          subscriptionStatus: student.subscription_status || 'free',
          subscriptionDate: student.subscription_date
            ? new Date(student.subscription_date).toISOString().split('T')[0]
            : '',
          progress,
        };
      });
      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error(`Failed to load students: ${error.message}`);
      setStudents([
        {
          id: '1',
          name: 'Anna Kask',
          email: 'anna.kask@email.com',
          level: 'A2',
          enrollmentDate: '2024-01-15',
          lastActive: '2024-01-20',
          status: 'active',
          examStatus: 'passed',
          examScore: 85,
          examAttempts: 1,
          subscription: 'Free',
          subscriptionStatus: 'free',
          subscriptionDate: '',
          progress: 10,
        },
      ]);
      setStudentModules([{ studentId: '1', moduleIds: [1, 2] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExamResults = () => {
    try {
      const savedResults = localStorage.getItem('examResults');
      if (savedResults) {
        setExamResults(JSON.parse(savedResults));
      }
    } catch (error) {
      console.error('Error loading exam results:', error);
      toast.error('Failed to load exam results');
    }
  };

  const loadSubscriptionSettings = () => {
    try {
      const savedSettings = localStorage.getItem('subscriptionSettings');
      if (savedSettings) {
        setSubscriptionSettings(JSON.parse(savedSettings));
      } else {
        localStorage.setItem('subscriptionSettings', JSON.stringify(subscriptionSettings));
      }
    } catch (error) {
      console.error('Error loading subscription settings:', error);
      toast.error('Failed to load subscription settings');
    }
  };

  const saveSubscriptionSettings = (settings: SubscriptionSettings) => {
    try {
      localStorage.setItem('subscriptionSettings', JSON.stringify(settings));
      setSubscriptionSettings(settings);
      toast.success('Subscription settings saved successfully!');
    } catch (error) {
      console.error('Error saving subscription settings:', error);
      toast.error('Failed to save subscription settings');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete student');
      }
      setStudents(students.filter((student) => student.id !== studentId));
      setStudentModules(studentModules.filter((sm) => sm.studentId !== studentId));
      const updatedExamResults = examResults.filter((result) => result.studentId !== studentId);
      setExamResults(updatedExamResults);
      localStorage.setItem('examResults', JSON.stringify(updatedExamResults));
      toast.success('Student deleted successfully!');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleResetProgress = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examStatus: 'not_taken',
          examScore: 0,
          examAttempts: 0,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to reset progress');
      }
      const updatedStudent = await response.json();
      const studentModulesResponse = await fetch(`/api/student-modules?studentId=${studentId}`, {
        method: 'DELETE',
      });
      if (!studentModulesResponse.ok) {
        throw new Error('Failed to reset student modules');
      }
      setStudents(
        students.map((student) =>
          student.id === studentId
            ? {
                ...student,
                examStatus: updatedStudent.exam_status || 'not_taken',
                examScore: updatedStudent.exam_score || 0,
                examAttempts: updatedStudent.exam_attempts || 0,
                progress: 0,
              }
            : student,
        ),
      );
      setStudentModules(studentModules.filter((sm) => sm.studentId !== studentId));
      const updatedExamResults = examResults.filter((result) => result.studentId !== studentId);
      setExamResults(updatedExamResults);
      localStorage.setItem('examResults', JSON.stringify(updatedExamResults));
      toast.success('Student progress reset successfully!');
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress');
    }
  };

  const toggleSubscriptionOverride = async (studentId: string) => {
    try {
      const student = students.find((s) => s.id === studentId);
      if (!student) throw new Error('Student not found');
      const newStatus = student.subscriptionStatus === 'admin_override' ? 'free' : 'admin_override';
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionStatus: newStatus,
          subscription: newStatus === 'admin_override' ? 'Admin Override' : 'Free',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update subscription override');
      }
      const updatedStudent = await response.json();
      setStudents(
        students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                subscriptionStatus: updatedStudent.subscription_status,
                subscription: updatedStudent.subscription,
              }
            : s,
        ),
      );
      const action = newStatus === 'admin_override' ? 'granted' : 'removed';
      toast.success(`Admin override ${action} successfully!`);
    } catch (error) {
      console.error('Error toggling subscription override:', error);
      toast.error('Failed to update subscription override');
    }
  };

  const exportStudents = () => {
    try {
      const csvContent = [
        [
          'Name',
          'Email',
          'Level',
          'Enrollment Date',
          'Progress',
          'Status',
          'Subscription',
          'Exam Status',
          'Exam Score',
          'Exam Attempts',
        ].join(','),
        ...students.map((student) =>
          [
            student.name || '',
            student.email || '',
            student.level || '',
            student.enrollmentDate || '',
            `${student.progress || 0}%`,
            student.status || '',
            student.subscription || 'Free',
            student.examStatus || 'not_taken',
            student.examScore || 0,
            student.examAttempts || 0,
          ].join(','),
        ),
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keele-seiklus-students-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Students exported successfully!');
    } catch (error) {
      console.error('Error exporting students:', error);
      toast.error('Failed to export students');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700">Suspended</Badge>;
      default:
        return <Badge>{status || 'Unknown'}</Badge>;
    }
  };

  const getSubscriptionBadge = (subscriptionStatus?: string, subscription?: string) => {
    switch (subscriptionStatus) {
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-700">Premium</Badge>;
      case 'admin_override':
        return <Badge className="bg-blue-100 text-blue-700">Admin Override</Badge>;
      case 'free':
      default:
        return <Badge className="bg-gray-100 text-gray-700">Free</Badge>;
    }
  };

  const getExamStatusBadge = (examStatus?: string, examScore?: number) => {
    switch (examStatus) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-700">Passed ({examScore || 0}%)</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed ({examScore || 0}%)</Badge>;
      case 'not_taken':
      default:
        return <Badge className="bg-gray-100 text-gray-700">Not Taken</Badge>;
    }
  };

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === 'active').length,
    avgProgress:
      students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length) : 0,
    completedExams: students.filter((s) => s.examStatus === 'passed').length,
    failedExams: students.filter((s) => s.examStatus === 'failed').length,
    pendingExams: students.filter((s) => s.examStatus === 'not_taken').length,
    premiumStudents: students.filter((s) => s.subscriptionStatus === 'premium').length,
    adminOverrides: students.filter((s) => s.subscriptionStatus === 'admin_override').length,
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const name = (student.name || '').toLowerCase();
    const email = (student.email || '').toLowerCase();
    const level = (student.level || '').toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower) || level.includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage students, track progress, and monitor subscriptions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setShowSettingsDialog(true)}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription Settings</span>
            <span className="sm:hidden">Settings</span>
          </Button>
          <Button onClick={exportStudents} variant="outline" className="w-full sm:w-auto bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/admin/students/new">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Students</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.activeStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Avg Progress</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.avgProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Premium</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.premiumStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Admin Override</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.adminOverrides}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Passed Exams</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.completedExams}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Failed Exams</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.failedExams}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending Exams</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.pendingExams}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students by name, email, or level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Students ({filteredStudents.length})</CardTitle>
          <CardDescription className="text-sm">
            Manage student accounts, subscriptions, and track their progress
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Student</TableHead>
                  <TableHead className="min-w-[80px]">Level</TableHead>
                  <TableHead className="min-w-[120px]">Progress</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Subscription</TableHead>
                  <TableHead className="min-w-[120px]">Exam Status</TableHead>
                  <TableHead className="min-w-[100px]">Last Active</TableHead>
                  <TableHead className="min-w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[180px]">
                          {student.email || 'No email'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.level || 'A1'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${student.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{student.progress || 0}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {studentModules.find((sm) => sm.studentId === student.id)?.moduleIds.length || 0}/
                        {totalModules} modules
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSubscriptionBadge(student.subscriptionStatus, student.subscription)}
                        {subscriptionSettings.enabled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSubscriptionOverride(student.id)}
                            className={`p-1 h-6 w-6 ${
                              student.subscriptionStatus === 'admin_override'
                                ? 'text-blue-600 hover:text-blue-700'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title={
                              student.subscriptionStatus === 'admin_override'
                                ? 'Remove admin override'
                                : 'Grant admin override'
                            }
                          >
                            <Crown className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getExamStatusBadge(student.examStatus, student.examScore)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : 'Never'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 flex-wrap gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDetailDialog(true);
                          }}
                          className="p-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/students/${student.id}/edit`}>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/communication/compose?student=${student.id}`}>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetProgress(student.id)}
                          className="text-orange-600 hover:text-orange-700 p-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete ${student.name || 'this student'}? This action cannot be undone.`,
                              )
                            ) {
                              handleDeleteStudent(student.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Settings</DialogTitle>
            <DialogDescription>Configure the subscription system for your Estonian learning platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Subscription System</Label>
                <div className="text-sm text-gray-500">
                  When enabled, students need premium access for modules beyond the free limit
                </div>
              </div>
              <Switch
                checked={subscriptionSettings.enabled}
                onCheckedChange={(checked) => setSubscriptionSettings({ ...subscriptionSettings, enabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="freeLimit">Free Module Limit</Label>
              <Input
                id="freeLimit"
                type="number"
                min="1"
                max={totalModules - 1}
                value={subscriptionSettings.freeModuleLimit}
                onChange={(e) =>
                  setSubscriptionSettings({
                    ...subscriptionSettings,
                    freeModuleLimit: Number.parseInt(e.target.value) || 10,
                  })
                }
                disabled={!subscriptionSettings.enabled}
              />
              <div className="text-sm text-gray-500">
                Students can access modules 1-{subscriptionSettings.freeModuleLimit} for free
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Current Configuration:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Modules 1-3: Always free (demo)</li>
                <li>• Modules 4-{subscriptionSettings.freeModuleLimit}: Free for logged-in users</li>
                <li>
                  • Modules {subscriptionSettings.freeModuleLimit + 1}-{totalModules}:{' '}
                  {subscriptionSettings.enabled ? 'Premium required' : 'Free for all'}
                </li>
                <li>• Admin can override subscription requirements per student</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Admin Override:</h4>
              <p className="text-sm text-yellow-800">
                Use the crown icon (👑) next to each student's subscription status to grant or remove admin override
                access. Students with admin override can access all modules regardless of their subscription status.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={() => {
                saveSubscriptionSettings(subscriptionSettings);
                setShowSettingsDialog(false);
              }}
              className="w-full sm:w-auto"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>Detailed information about {selectedStudent?.name || 'this student'}</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedStudent.name || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedStudent.email || 'No email'}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {selectedStudent.level || 'A1'}
                    </div>
                    <div>
                      <span className="font-medium">Enrollment:</span>{' '}
                      {selectedStudent.enrollmentDate
                        ? new Date(selectedStudent.enrollmentDate).toLocaleDateString()
                        : 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {getStatusBadge(selectedStudent.status)}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Progress & Subscription</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Progress:</span> {selectedStudent.progress || 0}%
                    </div>
                    <div>
                      <span className="font-medium">Completed Modules:</span>{' '}
                      {studentModules.find((sm) => sm.studentId === selectedStudent.id)?.moduleIds.length || 0}/
                      {totalModules}
                    </div>
                    <div>
                      <span className="font-medium">Subscription:</span>{' '}
                      {getSubscriptionBadge(selectedStudent.subscriptionStatus, selectedStudent.subscription)}
                    </div>
                    <div>
                      <span className="font-medium">Exam Status:</span>{' '}
                      {getExamStatusBadge(selectedStudent.examStatus, selectedStudent.examScore)}
                    </div>
                    <div>
                      <span className="font-medium">Exam Attempts:</span> {selectedStudent.examAttempts || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Progress */}
              <div>
                <h3 className="font-semibold mb-3">Module Progress</h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {Array.from({ length: totalModules }, (_, i) => i + 1).map((moduleId) => (
                    <Link key={moduleId} href={`/modules/${moduleId}`}>
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-colors ${
                          (studentModules.find((sm) => sm.studentId === selectedStudent.id)?.moduleIds || []).includes(
                            moduleId,
                          )
                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                            : moduleId <= 3
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                              : moduleId <= subscriptionSettings.freeModuleLimit
                                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={`Module ${moduleId} - ${
                          (studentModules.find((sm) => sm.studentId === selectedStudent.id)?.moduleIds || []).includes(
                            moduleId,
                          )
                            ? 'Completed'
                            : moduleId <= 3
                              ? 'Free Demo'
                              : moduleId <= subscriptionSettings.freeModuleLimit
                                ? 'Free'
                                : 'Premium Required'
                        }`}
                      >
                        {moduleId}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                    <span>Free Demo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span>Free</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                    <span>Premium</span>
                  </div>
                </div>
              </div>

              {/* Exam History */}
              {selectedStudent.examStatus !== 'not_taken' && (
                <div>
                  <h3 className="font-semibold mb-3">Exam History</h3>
                  <div className="space-y-2">
                    {examResults
                      .filter((result) => result.studentId === selectedStudent.id)
                      .map((result, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div>
                              <span className="font-medium">Attempt {result.attempt}</span>
                              <span className="ml-2 text-sm text-gray-600">
                                {new Date(result.completedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                              >
                                {result.score}% ({result.correctAnswers}/{result.totalQuestions})
                              </Badge>
                              <span className="text-sm text-gray-600">{Math.round(result.timeSpent / 60)}min</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="w-full sm:w-auto">
              Close
            </Button>
            {selectedStudent && (
              <Link href={`/admin/students/${selectedStudent.id}/edit`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Student
                </Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}