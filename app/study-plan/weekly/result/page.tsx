"use client";

import { useRouter } from "next/navigation";

export default function WeeklyResultPage() {
  const router = useRouter();

  const weeklySchedule = [
    {
      week: "Minggu 1 (20-26 Jan)",
      tasks: [
        { day: "Senin, 20 Jan", task: "Tugas DAA", hours: "3 jam", time: "14:00 - 17:00" },
        { day: "Rabu, 22 Jan", task: "Tugas DAA", hours: "3 jam", time: "09:00 - 12:00" },
        { day: "Jumat, 24 Jan", task: "Project Web", hours: "4 jam", time: "13:00 - 17:00" }
      ],
      totalHours: 10
    },
    {
      week: "Minggu 2 (27 Jan - 2 Feb)",
      tasks: [
        { day: "Senin, 27 Jan", task: "Project Web", hours: "3 jam", time: "14:00 - 17:00" },
        { day: "Rabu, 29 Jan", task: "Project Web", hours: "3 jam", time: "09:00 - 12:00" },
        { day: "Jumat, 31 Jan", task: "Belajar UTS", hours: "4 jam", time: "10:00 - 14:00" },
        { day: "Sabtu, 1 Feb", task: "Belajar UTS", hours: "4 jam", time: "09:00 - 13:00" }
      ],
      totalHours: 14
    }
  ];

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="result-icon">✅</div>
        <h1>Jadwal Mingguan Berhasil!</h1>
        <p>Beban tugas telah didistribusikan dengan merata</p>
      </div>

      <div className="result-summary">
        <div className="summary-card">
          <span className="summary-label">Total Jam</span>
          <span className="summary-value">24 jam</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Rata-rata/Minggu</span>
          <span className="summary-value">12 jam</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Tugas Selesai</span>
          <span className="summary-value">3/3</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Status</span>
          <span className="summary-value">✓ Seimbang</span>
        </div>
      </div>

      {weeklySchedule.map((week, weekIdx) => (
        <div key={weekIdx} className="weekly-section">
          <div className="weekly-header">
            <h3>{week.week}</h3>
            <span className="weekly-total">{week.totalHours} jam</span>
          </div>
          <div className="weekly-tasks">
            {week.tasks.map((item, idx) => (
              <div key={idx} className="weekly-task-item">
                <div className="task-day">{item.day}</div>
                <div className="task-info-weekly">
                  <strong>{item.task}</strong>
                  <div className="task-time">
                    <span>⏱️ {item.hours}</span>
                    <span>🕐 {item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="result-actions">
        <button className="btn-secondary" onClick={() => router.push("/study-plan/weekly")}>Buat Lagi</button>
        <button className="btn-primary">Simpan Jadwal</button>
      </div>
    </div>
  );
}