"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WeeklyConfig, WeeklyTask } from "@/lib/types";
import { validateWeeklyInput } from "@/lib/scheduler";

export default function WeeklyInputPage() {
  const router = useRouter();

  const [config, setConfig] = useState<WeeklyConfig>({
    startDate: "2026-01-20",
    weeks: 2,
    maxHoursPerWeek: 20,
    activeDays: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  });

  const [tasks, setTasks] = useState<WeeklyTask[]>([]);

  const handleGenerate = () => {
    const validation = validateWeeklyInput(config, tasks);
    if (!validation.valid) {
      alert(validation.errors.join("\n"));
      return;
    }

    sessionStorage.setItem(
      "weeklyScheduleData",
      JSON.stringify({ config, tasks })
    );

    router.push("/study-plan/weekly/process");
  };

  return (
    <div className="input-container">
      <div className="input-header">
        <h1>📅 JADWAL MINGGUAN</h1>
        <p>Distribusi tugas selama beberapa minggu secara seimbang</p>
      </div>

      {/* Periode */}
      <div className="input-section">
        <h3>📆 Periode</h3>
        <div className="input-row">
          <input type="date" value={config.startDate}
            onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
          />
          <select value={config.weeks}
            onChange={(e) => setConfig({ ...config, weeks: Number(e.target.value) })}
          >
            <option value={2}>2 Minggu</option>
            <option value={3}>3 Minggu</option>
          </select>
        </div>
      </div>

      {/* Kapasitas */}
      <div className="input-section">
        <h3>⚡ Kapasitas Mingguan</h3>
        <input
          type="number"
          value={config.maxHoursPerWeek}
          onChange={(e) =>
            setConfig({ ...config, maxHoursPerWeek: Number(e.target.value) })
          }
        />
      </div>

      {/* Action */}
      <div className="input-actions">
        <button className="btn-secondary" onClick={() => router.back()}>
          ← Kembali
        </button>
        <button className="btn-primary" onClick={handleGenerate}>
          Proses Jadwal →
        </button>
      </div>
    </div>
  );
}
