"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultSummary from "@/ui/ResultSummary";
import type { WeeklyResult } from "@/lib/types";

export default function WeeklyResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<WeeklyResult | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("weeklyScheduleResult");
    if (!data) {
      router.push("/study-plan/weekly");
      return;
    }

    const parsed = JSON.parse(data);
    if (!parsed.success) {
      router.push("/study-plan/weekly/invalid");
      return;
    }

    setResult(parsed);
  }, []);

  if (!result || !result.data) {
    return <div>Loading...</div>;
  }

  const { schedule, summary } = result.data;

  const summaryItems = [
    { label: "Total Jam", value: `${summary.totalHours} jam` },
    { label: "Rata-rata/Minggu", value: `${summary.averagePerWeek} jam` },
    { label: "Tugas Selesai", value: summary.tasksCompleted },
    { label: "Status", value: summary.status },
  ];

  const handleSave = async () => {
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleType: "weekly",
          title: "Weekly Schedule",
          result: result.data,
        }),
      });

      if (response.ok) {
        alert("Jadwal berhasil disimpan!");
        router.push("/study-plan");
      } else {
        alert("Gagal menyimpan jadwal");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Terjadi kesalahan saat menyimpan");
    }
  };

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="result-icon">✅</div>
        <h1>Jadwal Mingguan Berhasil!</h1>
        <p>Berikut adalah distribusi tugas mingguan yang optimal</p>
      </div>

      <ResultSummary items={summaryItems} />

      {/* Weekly Schedule */}
      <div className="weekly-schedule">
        <h3>📅 Jadwal Per Minggu</h3>

        {schedule.map((week, weekIdx) => (
          <div key={weekIdx} className="weekly-section">
            <div className="weekly-header">
              <h3>{week.week}</h3>
              <span className="weekly-total">{week.totalHours} jam</span>
            </div>

            <div className="weekly-tasks">
              {week.tasks.map((task, taskIdx) => (
                <div key={taskIdx} className="weekly-task-item">
                  <div className="task-day">{task.day}</div>
                  <div className="task-info-weekly">
                    <strong>{task.task}</strong>
                    <div className="task-time">
                      <span>⏱️ {task.hours}</span>
                      <span>🕐 {task.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="suggestion-box">
        <h3>💡 Tips Produktivitas</h3>
        <ul>
          <li>Ikuti jadwal yang sudah dibuat untuk hasil maksimal</li>
          <li>Gunakan waktu break untuk istirahat sejenak</li>
          <li>Jika ada perubahan, sesuaikan jadwal secara berkala</li>
          <li>
            Evaluasi progress setiap akhir minggu untuk perbaikan di minggu
            berikutnya
          </li>
        </ul>
      </div>

      <div className="result-actions">
        <button
          className="btn-secondary"
          onClick={() => router.push("/study-plan/weekly")}
        >
          ← Buat Ulang
        </button>
        <button className="btn-primary" onClick={handleSave}>
          💾 Simpan Jadwal
        </button>
      </div>
    </div>
  );
}