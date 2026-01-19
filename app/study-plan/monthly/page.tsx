"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MonthlyInputPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    month: "2026-01",
    maxHoursPerMonth: "80",
    blockedDates: ["10", "11", "12"]
  });

  const [tasks, setTasks] = useState([
    { name: "Proyek Besar", hours: "30", deadline: "25", priority: "tinggi" },
    { name: "UAS", hours: "20", deadline: "30", priority: "tinggi" },
    { name: "Tugas Mingguan", hours: "16", deadline: "15", priority: "sedang" }
  ]);

  const handleProcess = () => {
    router.push("/study-plan/monthly/process");
  };

  return (
    <div className="input-container">
      <div className="input-header">
        <h1>🗓️ JADWAL BULANAN</h1>
        <p>Rencanakan proyek dan ujian besar untuk 1 bulan ke depan</p>
      </div>

      <div className="input-section">
        <h3>📅 Periode Bulan</h3>
        <div className="input-row">
          <div className="input-group">
            <label>Pilih Bulan</label>
            <input type="month" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Max Productive Time (jam/bulan)</label>
            <input type="number" value={formData.maxHoursPerMonth} onChange={(e) => setFormData({...formData, maxHoursPerMonth: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="input-section">
        <h3>🚫 Tanggal Terblokir (Personal Time)</h3>
        <div className="blocked-dates">
          <div className="date-chips">
            {formData.blockedDates.map(date => (
              <div key={date} className="date-chip">
                {date} Januari
                <button className="chip-remove">×</button>
              </div>
            ))}
          </div>
          <button className="btn-add-small">+ Tambah Tanggal</button>
        </div>
        <p className="note">💡 Tanggal 10-12 = Libur Keluarga</p>
      </div>

      <div className="input-section">
        <h3>📚 Proyek & Ujian Besar</h3>
        <div className="task-list">
          {tasks.map((task, idx) => (
            <div key={idx} className="task-item-monthly">
              <div className="task-header-monthly">
                <strong>{task.name}</strong>
                <span className={`priority priority-${task.priority}`}>{task.priority}</span>
              </div>
              <div className="task-meta">
                <span>⏱️ {task.hours} jam total</span>
                <span>📅 Deadline: {task.deadline} Januari</span>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-add">+ Tambah Proyek/Ujian</button>
      </div>

      <div className="input-actions">
        <button className="btn-secondary" onClick={() => router.back()}>Kembali</button>
        <button className="btn-primary" onClick={handleProcess}>Proses Jadwal →</button>
      </div>
    </div>
  );
}