"use client";

import { useRouter } from "next/navigation";

export default function MonthlyInvalidPage() {
  const router = useRouter();

  return (
    <div className="invalid-container">
      <div className="invalid-header">
        <div className="invalid-icon">❌</div>
        <h1>Jadwal Bulanan Tidak Valid</h1>
        <p>Tidak dapat mendistribusikan proyek secara realistis</p>
      </div>

      <div className="suggestion-box">
        <ul>
          <li>Kurangi jam proyek</li>
          <li>Naikkan max jam bulanan</li>
          <li>Kurangi tanggal terblokir</li>
          <li>Pecah proyek besar</li>
        </ul>
      </div>

      <div className="invalid-actions">
        <button className="btn-primary" onClick={() => router.back()}>
          ← Perbaiki Input
        </button>
      </div>
    </div>
  );
}
