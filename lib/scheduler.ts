// =============================================
// CLIENT-SIDE SCHEDULER UTILITIES
// =============================================

import type { 
  ScheduleType, 
  SchedulePayload,
  DailyResult,
  WeeklyResult,
  MonthlyResult
} from "./types";

/**
 * Run scheduler by calling Python backend
 */
export async function runScheduler(
  mode: ScheduleType,
  payload: SchedulePayload
): Promise<DailyResult | WeeklyResult | MonthlyResult> {
  try {
    const response = await fetch("/api/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode,
        payload,
      }),
    });

    if (!response.ok) {
      throw new Error("Scheduler request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Scheduler error:", error);
    return {
      success: false,
      errors: [
        {
          type: "System",
          message: "Failed to run scheduler. Please try again.",
        },
      ],
      suggestions: ["Check your internet connection", "Refresh the page"],
    };
  }
}

/**
 * Validate daily schedule input
 */
export function validateDailyInput(
  config: any,
  activities: any[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.startTime || !config.endTime) {
    errors.push("Start time and end time are required");
  }

  if (!config.personalStart || !config.personalEnd) {
    errors.push("Personal time is required");
  }

  if (!config.breakTime || config.breakTime < 0) {
    errors.push("Break time must be positive");
  }

  if (!config.maxProductive || config.maxProductive < 0) {
    errors.push("Max productive time must be positive");
  }

  if (activities.length === 0) {
    errors.push("At least one activity is required");
  }

  activities.forEach((act, i) => {
    if (!act.name || !act.duration || !act.priority) {
      errors.push(`Activity ${i + 1} is incomplete`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Validate weekly schedule input
 */
export function validateWeeklyInput(
  config: any,
  tasks: any[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.startDate) {
    errors.push("Start date is required");
  }

  if (!config.maxHoursPerWeek || config.maxHoursPerWeek < 0) {
    errors.push("Max hours per week must be positive");
  }

  if (!config.activeDays || config.activeDays.length === 0) {
    errors.push("At least one active day is required");
  }

  if (!config.weeks || config.weeks < 1) {
    errors.push("Number of weeks must be at least 1");
  }

  if (tasks.length === 0) {
    errors.push("At least one task is required");
  }

  tasks.forEach((task, i) => {
    if (!task.name || !task.duration || !task.deadline) {
      errors.push(`Task ${i + 1} is incomplete`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Validate monthly schedule input
 */
export function validateMonthlyInput(
  config: any,
  tasks: any[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.startDate) {
    errors.push("Start date is required");
  }

  if (!config.maxHoursPerMonth || config.maxHoursPerMonth < 0) {
    errors.push("Max hours per month must be positive");
  }

  if (tasks.length === 0) {
    errors.push("At least one task is required");
  }

  tasks.forEach((task, i) => {
    if (!task.name || !task.duration || !task.deadline) {
      errors.push(`Task ${i + 1} is incomplete`);
    }
    if (task.deadline < 1 || task.deadline > 31) {
      errors.push(`Task ${i + 1}: deadline must be between 1-31`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Save schedule to database
 */
export async function saveSchedule(
  scheduleType: ScheduleType,
  config: any,
  result: any
): Promise<{ success: boolean; scheduleId?: number }> {
  try {
    const response = await fetch("/api/schedules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scheduleType,
        config,
        result,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save schedule");
    }

    const data = await response.json();
    return { success: true, scheduleId: data.id };
  } catch (error) {
    console.error("Save schedule error:", error);
    return { success: false };
  }
}

/**
 * Format time utilities
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Get Indonesian day name
 */
export function getDayName(date: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[date.getDay()];
}

/**
 * Format date to Indonesian
 */
export function formatDateID(date: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Ags", "Sep", "Oct", "Nov", "Des"
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}