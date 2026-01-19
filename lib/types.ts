// =============================================
// TYPE DEFINITIONS
// =============================================

// ============================================
// DAILY SCHEDULE TYPES
// ============================================
export interface DailyConfig {
  startTime: string; // "08:00"
  endTime: string; // "16:00"
  personalStart: string; // "12:00"
  personalEnd: string; // "13:00"
  breakTime: number; // minutes
  maxProductive: number; // minutes
}

export interface DailyActivity {
  name: string;
  duration: number; // minutes
  priority: "tinggi" | "sedang" | "rendah";
}

export interface DailyScheduleItem {
  time: string; // "08:00 - 09:30"
  activity: string;
  duration: string; // "90 menit"
  reason: string;
}

export interface DailySummary {
  totalProductive: number;
  breakTime: number;
  personalTime: number;
  endTime: string;
}

export interface DailyResult {
  success: boolean;
  data?: {
    schedule: DailyScheduleItem[];
    summary: DailySummary;
  };
  errors?: ScheduleError[];
  suggestions?: string[];
}

// ============================================
// WEEKLY SCHEDULE TYPES
// ============================================
export interface WeeklyConfig {
  startDate: string; // "2026-01-20"
  maxHoursPerWeek: number;
  activeDays: string[]; // ["Senin", "Selasa", ...]
  weeks: number;
}

export interface WeeklyTask {
  name: string;
  duration: number; // hours
  deadline: string; // "2026-01-25"
}

export interface WeeklyTaskItem {
  day: string; // "Senin, 20 Jan"
  task: string;
  hours: string; // "6 jam"
  time: string; // "14:00 - 17:00"
}

export interface WeeklyScheduleWeek {
  week: string; // "Minggu 1 (20-26 Jan)"
  tasks: WeeklyTaskItem[];
  totalHours: number;
}

export interface WeeklySummary {
  totalHours: number;
  averagePerWeek: number;
  tasksCompleted: string;
  status: string;
}

export interface WeeklyResult {
  success: boolean;
  data?: {
    schedule: WeeklyScheduleWeek[];
    summary: WeeklySummary;
  };
  errors?: ScheduleError[];
  suggestions?: string[];
}

// ============================================
// MONTHLY SCHEDULE TYPES
// ============================================
export interface MonthlyConfig {
  startDate: string; // "2026-01-01"
  maxHoursPerMonth: number;
  blockedDates: number[]; // [10, 11, 12]
}

export interface MonthlyTask {
  name: string;
  duration: number; // hours
  deadline: number; // day of month
}

export interface MonthlyTaskItem {
  date: string; // "20 Jan"
  task: string;
  hours: string; // "4 jam"
}

export interface MonthlyWeek {
  weekLabel: string; // "Minggu 1 (1-7 Jan)"
  tasks: MonthlyTaskItem[];
  isBlocked: boolean;
}

export interface MonthlySummary {
  totalHours: number;
  averagePerWeek: number;
  productiveDays: number;
  status: string;
}

export interface MonthlyResult {
  success: boolean;
  data?: {
    schedule: MonthlyWeek[];
    summary: MonthlySummary;
  };
  errors?: ScheduleError[];
  suggestions?: string[];
}

// ============================================
// COMMON TYPES
// ============================================
export interface ScheduleError {
  type: string;
  message: string;
}

export type ScheduleType = "daily" | "weekly" | "monthly";

export interface SchedulePayload {
  config: DailyConfig | WeeklyConfig | MonthlyConfig;
  activities?: DailyActivity[];
  tasks?: WeeklyTask[] | MonthlyTask[];
}

// ============================================
// CALENDAR TYPES
// ============================================
export interface ImportantDate {
  id: number;
  userId: number;
  date: string; // ISO date
  title: string;
  description?: string;
  color: string; // hex color
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
}

export interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  type: "study" | "break" | "deadline" | "exam" | "important";
  color: string;
  time?: string;
}

// ============================================
// DATABASE TYPES
// ============================================
export interface Schedule {
  id: number;
  userId: number;
  scheduleType: ScheduleType;
  title: string;
  startDate: string;
  endDate: string;
  resultData?: any;
  status: "draft" | "success" | "failed";
  errorMessages?: ScheduleError[];
  createdAt: string;
  updatedAt: string;
}