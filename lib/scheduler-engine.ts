// =============================================
// SMART SCHEDULING - TypeScript Engine
// Converted from Python to run on Vercel
// =============================================

// ============================================
// HELPER FUNCTIONS
// ============================================

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function getDayName(date: Date): string {
  // JS: 0=Sunday, Python weekday: 0=Monday
  const idx = (date.getDay() + 6) % 7;
  return DAY_NAMES[idx];
}

function formatDateShort(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  return `${date.getDate().toString().padStart(2, "0")} ${months[date.getMonth()]}`;
}

function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// ============================================
// TYPES
// ============================================

interface ScheduleError {
  type: string;
  message: string;
}

interface ScheduleResult {
  success: boolean;
  data?: any;
  errors?: ScheduleError[];
  suggestions?: string[];
}

// ============================================
// DAILY SCHEDULER
// ============================================

interface DailyConfig {
  startTime: string;
  endTime: string;
  personalStart: string;
  personalEnd: string;
  breakTime: number;
  maxProductive: number;
}

interface DailyActivity {
  name: string;
  duration: number;
  priority: "tinggi" | "sedang" | "rendah";
}

interface DailyScheduleItem {
  time: string;
  activity: string;
  duration: string;
  reason: string;
}

export function runDaily(payload: { config: DailyConfig; activities: DailyActivity[] }): ScheduleResult {
  const { config, activities } = payload;

  const start = timeToMinutes(config.startTime);
  const end = timeToMinutes(config.endTime);
  const personalStartRaw = timeToMinutes(config.personalStart);
  const personalEndRaw = timeToMinutes(config.personalEnd);
  const breakTime = config.breakTime;
  const maxProductive = config.maxProductive;

  // Personal time only clipped if overlap
  const personalStart = Math.max(start, Math.min(personalStartRaw, end));
  const personalEnd = Math.max(start, Math.min(personalEndRaw, end));
  const personalOverlap = Math.max(0, personalEnd - personalStart);

  // Don't double count personal time
  const availableTime = (end - start) - personalOverlap;

  // Break calculated logically
  const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);
  const breaksNeeded = Math.max(0, activities.length - 1) * breakTime;
  const totalNeeded = totalDuration + breaksNeeded;

  if (totalNeeded > availableTime) {
    return {
      success: false,
      errors: [
        {
          type: "Waktu",
          message: `Total waktu yang dibutuhkan (${totalNeeded} menit) melebihi waktu tersedia (${availableTime} menit)`,
        },
      ],
      suggestions: [
        `Perpanjang waktu aktif (End Time → ${minutesToTime(start + totalNeeded + personalOverlap)})`,
        "Kurangi Personal Time",
        "Kurangi Break Time per aktivitas",
      ],
    };
  }

  // Sort: priority high→low, then duration desc
  const priorityOrder: Record<string, number> = { tinggi: 3, sedang: 2, rendah: 1 };
  const sortedActivities = [...activities].sort((a, b) => {
    const pDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (pDiff !== 0) return pDiff;
    return b.duration - a.duration;
  });

  const schedule: DailyScheduleItem[] = [];
  let personalTimeAdded = false;

  function getReason(activity: DailyActivity, timeSlot: number): string {
    const reasons: Record<string, string> = {
      tinggi: "Prioritas tinggi - dikerjakan saat fresh dan fokus maksimal",
      sedang: "Prioritas menengah - diselesaikan sebelum break time",
      rendah: "Prioritas rendah - cocok dikerjakan saat sisa waktu",
    };
    const base = reasons[activity.priority];
    if (timeSlot < personalStart) return base + " (sebelum personal time)";
    if (timeSlot >= personalEnd) return base + " (setelah personal time)";
    return base;
  }

  let currentTime = start;
  let totalProductive = 0;

  for (let i = 0; i < sortedActivities.length; i++) {
    const activity = sortedActivities[i];
    let remaining = activity.duration;

    if (totalProductive >= maxProductive) break;

    while (remaining > 0) {
      // Handle personal time
      if (!personalTimeAdded && personalOverlap > 0 && currentTime < personalEnd && currentTime >= personalStart) {
        schedule.push({
          time: `${minutesToTime(personalStart)} - ${minutesToTime(personalEnd)}`,
          activity: "Personal Time 🍽️",
          duration: `${personalEnd - personalStart} menit`,
          reason: "Waktu untuk makan, istirahat, atau kegiatan pribadi",
        });
        currentTime = personalEnd;
        personalTimeAdded = true;
        continue;
      }

      let nextLimit = end;
      if (!personalTimeAdded && personalOverlap > 0 && currentTime < personalStart) {
        nextLimit = personalStart;
      }

      const slotAvailable = nextLimit - currentTime;
      const productiveLeft = maxProductive - totalProductive;
      const alloc = Math.min(remaining, slotAvailable, productiveLeft);

      if (alloc <= 0) break;

      schedule.push({
        time: `${minutesToTime(currentTime)} - ${minutesToTime(currentTime + alloc)}`,
        activity: activity.name,
        duration: `${alloc} menit`,
        reason: getReason(activity, currentTime),
      });

      currentTime += alloc;
      totalProductive += alloc;
      remaining -= alloc;

      // Break after completing activity
      if (remaining === 0) {
        const atPersonalStart = personalOverlap > 0 && currentTime === personalStart;
        if (breakTime > 0 && !atPersonalStart && currentTime + breakTime <= end) {
          schedule.push({
            time: `${minutesToTime(currentTime)} - ${minutesToTime(currentTime + breakTime)}`,
            activity: "Break Time ☕",
            duration: `${breakTime} menit`,
            reason: "Istirahat untuk menjaga fokus dan produktivitas",
          });
          currentTime += breakTime;
        }
      }
    }
  }

  // Add personal time if not yet added
  if (!personalTimeAdded && personalOverlap > 0 && currentTime <= personalStart) {
    if (currentTime < personalStart) {
      currentTime = personalStart;
    }
    schedule.push({
      time: `${minutesToTime(personalStart)} - ${minutesToTime(personalEnd)}`,
      activity: "Personal Time 🍽️",
      duration: `${personalEnd - personalStart} menit`,
      reason: "Waktu untuk makan, istirahat, atau kegiatan pribadi",
    });
    currentTime = personalEnd;
  }

  // Calculate total break from schedule
  const totalBreak = schedule
    .filter((item) => item.activity === "Break Time ☕")
    .reduce((sum, item) => sum + parseInt(item.duration.split(" ")[0]), 0);

  return {
    success: true,
    data: {
      schedule,
      summary: {
        totalProductive,
        breakTime: totalBreak,
        personalTime: personalOverlap,
        endTime: minutesToTime(currentTime),
      },
    },
  };
}

// ============================================
// WEEKLY SCHEDULER
// ============================================

interface WeeklyConfig {
  maxHoursPerWeek: number;
  activeDays: string[];
  weeks: number;
  startDate: string;
  maxHoursPerDay?: number;
}

interface WeeklyTask {
  name: string;
  duration: number;
  deadline: string;
}

export function runWeekly(payload: { config: WeeklyConfig; tasks: WeeklyTask[] }): ScheduleResult {
  const { config, tasks } = payload;

  const maxWeekly = config.maxHoursPerWeek;
  const activeDays = config.activeDays;
  const weeks = config.weeks;
  const startDate = parseDate(config.startDate);
  const maxDaily = config.maxHoursPerDay ?? maxWeekly;

  // Validation
  if (!activeDays || activeDays.length === 0) {
    return {
      success: false,
      errors: [{ type: "Hari", message: "Tidak ada hari aktif yang dipilih" }],
      suggestions: ["Pilih minimal 1 hari aktif belajar"],
    };
  }

  const totalHours = tasks.reduce((sum, t) => sum + t.duration, 0);
  const maxCapacity = maxWeekly * weeks;

  if (totalHours > maxCapacity) {
    return {
      success: false,
      errors: [
        {
          type: "Kapasitas",
          message: `Total jam tugas (${totalHours} jam) melebihi kapasitas (${maxCapacity} jam)`,
        },
      ],
      suggestions: ["Kurangi durasi tugas", "Tambah minggu", "Tambah max jam per minggu"],
    };
  }

  // Sort tasks by deadline
  const tasksSorted = [...tasks].sort(
    (a, b) => parseDate(a.deadline).getTime() - parseDate(b.deadline).getTime()
  );

  const weeklySchedule: Record<number, any[]> = {};
  const weeklyHours: Record<number, number> = {};
  const dailyHours: Record<number, Record<string, number>> = {};

  for (let i = 0; i < weeks; i++) {
    weeklySchedule[i] = [];
    weeklyHours[i] = 0;
    dailyHours[i] = {};
  }

  // Assign tasks
  for (const task of tasksSorted) {
    const deadline = parseDate(task.deadline);
    const daysDiff = Math.floor((deadline.getTime() - startDate.getTime()) / (86400000));

    if (daysDiff < 0) {
      return {
        success: false,
        errors: [
          {
            type: "Deadline",
            message: `Deadline tugas '${task.name}' lebih awal dari tanggal mulai`,
          },
        ],
        suggestions: ["Periksa tanggal deadline", "Mundurkan start date", "Perbarui deadline tugas"],
      };
    }

    const latestWeek = Math.min(weeks - 1, Math.floor(daysDiff / 7));
    let assigned = false;

    for (let week = 0; week <= latestWeek; week++) {
      if (weeklyHours[week] + task.duration > maxWeekly) continue;

      const weekStart = addDays(startDate, week * 7);
      const candidates: [number, string, Date][] = [];

      for (let d = 0; d < 7; d++) {
        const date = addDays(weekStart, d);
        if (date > deadline) continue;

        const dayName = getDayName(date);
        if (!activeDays.includes(dayName)) continue;

        const used = dailyHours[week][dayName] || 0;
        if (used + task.duration > maxDaily) continue;

        candidates.push([used, dayName, date]);
      }

      // Pick day with least load
      if (candidates.length > 0) {
        candidates.sort((a, b) => a[0] - b[0]);
        const [used, dayName, date] = candidates[0];

        weeklySchedule[week].push({
          day: `${dayName}, ${formatDateShort(date)}`,
          task: task.name,
          hours: `${task.duration} jam`,
          time: "19:00 - 21:00",
        });

        weeklyHours[week] += task.duration;
        dailyHours[week][dayName] = (dailyHours[week][dayName] || 0) + task.duration;
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      return {
        success: false,
        errors: [
          {
            type: "Penjadwalan",
            message: `Tugas '${task.name}' tidak dapat dijadwalkan sebelum deadline`,
          },
        ],
        suggestions: ["Tambah hari aktif", "Tambah max jam per minggu", "Mundurkan deadline"],
      };
    }
  }

  // Format output
  const result = [];
  let total = 0;
  let completed = 0;

  for (let week = 0; week < weeks; week++) {
    const ws = addDays(startDate, week * 7);
    const we = addDays(ws, 6);

    total += weeklyHours[week];
    completed += weeklySchedule[week].length;

    result.push({
      week: `Minggu ${week + 1} (${ws.getDate().toString().padStart(2, "0")}-${formatDateShort(we)})`,
      tasks: weeklySchedule[week],
      totalHours: weeklyHours[week],
    });
  }

  return {
    success: true,
    data: {
      schedule: result,
      summary: {
        totalHours: total,
        averagePerWeek: Math.round((total / weeks) * 10) / 10,
        tasksCompleted: `${completed}/${tasks.length}`,
        status: completed === tasks.length ? "✓ Seimbang" : "⚠ Tidak Lengkap",
      },
    },
  };
}

// ============================================
// MONTHLY SCHEDULER
// ============================================

interface MonthlyConfig {
  maxHoursPerMonth: number;
  maxHoursPerDay?: number;
  blockedDates?: number[];
  startDate: string;
}

interface MonthlyTask {
  name: string;
  duration: number;
  deadline: number;
}

export function runMonthly(payload: { config: MonthlyConfig; tasks: MonthlyTask[] }): ScheduleResult {
  const { config, tasks } = payload;

  const maxMonthly = config.maxHoursPerMonth;
  const maxDailyHours = config.maxHoursPerDay ?? 6;
  const blockedDates = new Set(config.blockedDates || []);
  const startDate = parseDate(config.startDate);

  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const totalDays = daysInMonth(year, month);

  // Validation
  const totalHours = tasks.reduce((sum, t) => sum + t.duration, 0);
  if (totalHours > maxMonthly) {
    return {
      success: false,
      errors: [
        {
          type: "Kapasitas",
          message: `Total jam proyek (${totalHours} jam) melebihi kapasitas bulanan (${maxMonthly} jam)`,
        },
      ],
      suggestions: ["Tambah max jam per bulan", "Kurangi durasi proyek", "Pecah proyek besar"],
    };
  }

  for (const d of blockedDates) {
    if (d < 1 || d > totalDays) {
      return {
        success: false,
        errors: [{ type: "Tanggal", message: `Tanggal terblokir (${d}) tidak valid untuk bulan ini` }],
        suggestions: ["Periksa tanggal terblokir"],
      };
    }
  }

  if (blockedDates.size === totalDays) {
    return {
      success: false,
      errors: [{ type: "Tanggal", message: "Tidak ada hari produktif tersedia dalam bulan ini" }],
      suggestions: ["Hapus beberapa tanggal terblokir", "Pindahkan proyek ke bulan lain"],
    };
  }

  for (const t of tasks) {
    if (t.deadline < 1 || t.deadline > totalDays) {
      return {
        success: false,
        errors: [{ type: "Deadline", message: `Deadline tugas '${t.name}' tidak valid` }],
        suggestions: ["Periksa deadline tugas"],
      };
    }
  }

  // Sort by earliest deadline
  const tasksSorted = [...tasks].sort((a, b) => a.deadline - b.deadline);

  // State tracking
  const dailyHoursMap: Record<number, number> = {};
  const monthSchedule: Record<number, { task: string; hours: number }[]> = {};
  for (let d = 1; d <= totalDays; d++) {
    dailyHoursMap[d] = 0;
    monthSchedule[d] = [];
  }
  let totalScheduled = 0;

  // Assign tasks (split aware)
  for (const task of tasksSorted) {
    let remaining = task.duration;
    const deadline = task.deadline;

    for (let day = deadline; day >= 1; day--) {
      if (remaining <= 0) break;
      if (blockedDates.has(day)) continue;

      const available = maxDailyHours - dailyHoursMap[day];
      if (available <= 0) continue;

      const alloc = Math.min(available, remaining);
      if (totalScheduled + alloc > maxMonthly) break;

      monthSchedule[day].push({ task: task.name, hours: alloc });
      dailyHoursMap[day] += alloc;
      totalScheduled += alloc;
      remaining -= alloc;
    }

    if (remaining > 0) {
      return {
        success: false,
        errors: [
          {
            type: "Penjadwalan",
            message: `Tugas '${task.name}' tidak dapat dijadwalkan sebelum deadline`,
          },
        ],
        suggestions: [
          "Tambah max jam per hari",
          "Kurangi tanggal terblokir",
          "Mundurkan deadline",
          "Pecah proyek besar",
        ],
      };
    }
  }

  // Format output (per week)
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const monthName = months[month];

  const weeklySchedule = [];

  for (let week = 0; week < 5; week++) {
    const weekStart = week * 7 + 1;
    const weekEnd = Math.min(weekStart + 6, totalDays);

    const tasksWeek: { date: string; task: string; hours: string }[] = [];
    let hasBlocked = false;

    for (let d = weekStart; d <= weekEnd; d++) {
      if (blockedDates.has(d)) hasBlocked = true;

      for (const t of monthSchedule[d]) {
        tasksWeek.push({
          date: `${d} ${monthName}`,
          task: t.task,
          hours: `${t.hours} jam`,
        });
      }
    }

    weeklySchedule.push({
      weekLabel: `Minggu ${week + 1} (${weekStart}-${weekEnd} ${monthName})`,
      tasks: tasksWeek,
      isBlocked: hasBlocked,
    });
  }

  const productiveDays = Object.values(dailyHoursMap).filter((h) => h > 0).length;

  return {
    success: true,
    data: {
      schedule: weeklySchedule,
      summary: {
        totalHours: totalScheduled,
        averagePerWeek: Math.round((totalScheduled / 4) * 10) / 10,
        productiveDays,
        status: totalScheduled <= maxMonthly * 0.8 ? "✓ Realistis" : "⚠ Padat",
      },
    },
  };
}
