"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultSummary from "@/ui/ResultSummary";
import type { MonthlyResult } from "@/lib/types";

export default function MonthlyResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<MonthlyResult | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("monthlyScheduleResult");
    if (!data) {
      router.push("/study-plan/monthly");
      return;
    }

    const parsed = JSON.parse(data);
    if (!parsed.success) {
      router.push("/study-plan/monthly/invalid");
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
    { label: "Rata-rata/Minggu", value: `${summary.averagePerWeek.toFixed(1)} jam` },
    { label: "Hari Produktif", value: `${summary.productiveDays} hari` },
    { label: "Status", value: summary.status },
  ];

  const handleSave = async () => {
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleType: "monthly",
          title: "Monthly Schedule",
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
        <h1>Jadwal Bulanan Berhasil!</h1>
        <p>Berikut adalah perencanaan proyek bulanan yang optimal</p>
      </div>

      <ResultSummary items={summaryItems} />

      {/* Monthly Calendar */}
      <div className="monthly-calendar">
        <h3>📅 Jadwal Per Minggu</h3>

        {schedule.map((week, weekIdx) => (
          <div key={weekIdx} className="calendar-week">
            <h4>{week.weekLabel}</h4>

            {week.isBlocked && (
              <div className="blocked-notice">
                ⚠️ Minggu ini memiliki tanggal terblokir
              </div>
            )}

            {week.tasks.length === 0 ? (
              <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
                Tidak ada tugas terjadwal minggu ini
              </div>
            ) : (
              <div className="calendar-tasks">
                {week.tasks.map((task, taskIdx) => (
                  <div key={taskIdx} className="calendar-task">
                    <span className="task-date">{task.date}</span>
                    <span className="task-name">{task.task}</span>
                    <span className="task-hours">{task.hours}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="suggestion-box">
        <h3>💡 Tips Manajemen Proyek</h3>
        <ul>
          <li>Pecah proyek besar menjadi milestone kecil untuk tracking lebih baik</li>
          <li>Review progress setiap minggu dan sesuaikan jadwal jika perlu</li>
          <li>Sisakan buffer time untuk unexpected delays</li>
          <li>Prioritaskan proyek dengan deadline terdekat</li>
          <li>Komunikasikan dengan tim jika ada perubahan timeline</li>
        </ul>
      </div>

      {/* Monthly Overview */}
      <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>📊 Ringkasan Bulanan</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <strong>Total Proyek:</strong> {schedule.reduce((sum, w) => sum + w.tasks.length, 0)}
          </div>
          <div>
            <strong>Minggu Aktif:</strong> {schedule.filter(w => w.tasks.length > 0).length}
          </div>
          <div>
            <strong>Beban Terberat:</strong> Minggu {schedule.findIndex(w => w.tasks.length === Math.max(...schedule.map(s => s.tasks.length))) + 1}
          </div>
          <div>
            <strong>Estimasi Selesai:</strong> {schedule[schedule.length - 1].weekLabel.split('(')[1].split(')')[0].split('-')[1]}
          </div>
        </div>
      </div>

      <div className="result-actions">
        <button
          className="btn-secondary"
          onClick={() => router.push("/study-plan/monthly")}
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