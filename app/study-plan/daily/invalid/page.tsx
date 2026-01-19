"use client";

import { useRouter } from "next/navigation";

export default function DailyInvalidPage() {
  const router = useRouter();

  const errors = [
    { type: "Kapasitas", message: "Total durasi aktivitas (270 menit) melebihi Productive Time max (240 menit)" },
    { type: "Deadline", message: "Tugas DAA tidak bisa selesai sebelum deadline (16:00)" },
    { type: "Waktu", message: "Personal Time bentrok dengan jadwal aktivitas" }
  ];

  return (
    <div className="invalid-container">
      <div className="invalid-header">
        <div className="invalid-icon">❌</div>
        <h1>Jadwal Tidak Valid</h1>
        <p>Sistem tidak dapat membuat jadwal dengan data yang diberikan</p>
      </div>

      <div className="error-list">
        <h3>⚠️ Masalah yang Ditemukan:</h3>
        {errors.map((error, idx) => (
          <div key={idx} className="error-item">
            <div className="error-badge">{error.type}</div>
            <p>{error.message}</p>
          </div>
        ))}
      </div>

      <div className="suggestion-box">
        <h3>💡 Saran Perbaikan:</h3>
        <ul>
          <li>Kurangi durasi beberapa aktivitas</li>
          <li>Perpanjang waktu aktif (misal: 08:00 - 17:00)</li>
          <li>Tingkatkan Productive Time max</li>
          <li>Sesuaikan waktu Personal Time</li>
          <li>Prioritaskan aktivitas yang lebih penting</li>
        </ul>
      </div>

      <div className="invalid-actions">
        <button className="btn-primary" onClick={() => router.push("/study-plan/daily")}>← Kembali & Perbaiki</button>
      </div>
    </div>
  );
}