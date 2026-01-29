// app/study-plan/daily/invalid/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WarningIcon, BlockIcon, LightbulbIcon, InfoIcon, InlineIcon } from "@/components/Icon";
import Loading from "@/components/Loading";
import type { DailyResult } from "@/lib/types";

export default function DailyInvalidPage() {
  const router = useRouter();
  const [result, setResult] = useState<DailyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem("dailyScheduleResult");
    if (!data) {
      router.push("/study-plan/daily");
      return;
    }

    const parsed = JSON.parse(data);
    setResult(parsed);
    setLoading(false);
  }, [router]);

  if (loading || !result) {
    return <Loading text="Memuat informasi..." />;
  }

  const errors = result.errors || [];
  const suggestions = result.suggestions || [];

  return (
    <div className="invalid-container">
      <div className="invalid-header">
        <WarningIcon size={80} />
        <h1>Jadwal Tidak Valid</h1>
        <p>Sistem tidak dapat membuat jadwal dengan parameter yang diberikan</p>
      </div>

      {/* Error List */}
      {errors.length > 0 && (
        <div className="error-list">
          <h3>
            <BlockIcon size={24} className="mr-2" color="#ef4444" />
            Masalah yang Ditemukan:
          </h3>
          {errors.map((error, index) => (
            <div key={index} className="error-item">
              <span className="error-badge">{error.type}</span>
              <p>{error.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestion-box">
          <h3>
            <LightbulbIcon size={24} className="mr-2" />
            Saran Perbaikan:
          </h3>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Visual Guide */}
      <div className="suggestion-box">
        <h3>
          <InfoIcon size={24} className="mr-2" />
          Kemungkinan Penyebab:
        </h3>
        <ul>
          <li>
            <strong>Total durasi aktivitas terlalu besar:</strong> Jumlah menit
            semua aktivitas melebihi Productive Time max
          </li>
          <li>
            <strong>Personal Time bentrok:</strong> Personal Time memotong
            waktu yang dibutuhkan untuk aktivitas
          </li>
          <li>
            <strong>Waktu aktif terlalu pendek:</strong> Selisih Start Time dan
            End Time tidak cukup untuk semua aktivitas + break
          </li>
          <li>
            <strong>Break time terlalu lama:</strong> Break time mengambil
            terlalu banyak waktu produktif
          </li>
        </ul>
      </div>

      {/* Time Calculation */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
        }}
      >
        <h3 style={{ marginBottom: "16px", fontSize: "18px" }}>
          ⏰ Contoh Perhitungan Waktu:
        </h3>

        <div
          style={{
            background: "#f0fdf4",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "2px solid #48bb78",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#166534" }}>
            ✅ Skenario VALID:
          </div>
          <div style={{ fontSize: "14px", lineHeight: "1.8", color: "#333" }}>
            • Waktu aktif: 08:00 - 16:00 = <strong>480 menit</strong>
            <br />
            • Personal time: 12:00 - 13:00 = <strong>60 menit</strong>
            <br />
            • Waktu tersedia: 480 - 60 = <strong>420 menit</strong>
            <br />
            • Max productive: <strong>360 menit</strong>
            <br />
            • Break (3x @ 15 menit): <strong>45 menit</strong>
            <br />
            • Total: 360 + 45 = 405 menit ≤ 420 menit ✓
          </div>
        </div>

        <div
          style={{
            background: "#fee2e2",
            padding: "16px",
            borderRadius: "8px",
            border: "2px solid #ef4444",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#991b1b" }}>
            ❌ Skenario INVALID:
          </div>
          <div style={{ fontSize: "14px", lineHeight: "1.8", color: "#333" }}>
            • Waktu aktif: 08:00 - 15:00 = <strong>420 menit</strong>
            <br />
            • Personal time: 12:00 - 14:00 = <strong>120 menit</strong>
            <br />
            • Waktu tersedia: 420 - 120 = <strong>300 menit</strong>
            <br />
            • Max productive: <strong>360 menit</strong> ❌
            <br />
            • Aktivitas tidak muat!
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
        }}
      >
        <h3 style={{ marginBottom: "12px", fontSize: "18px" }}>
          🔧 Solusi Cepat:
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div
            style={{
              padding: "12px",
              background: "#f0f9ff",
              borderRadius: "8px",
              borderLeft: "4px solid #3b82f6",
            }}
          >
            <strong>Perpanjang waktu aktif</strong>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              Misal: 08:00 - 17:00
            </div>
          </div>
          <div
            style={{
              padding: "12px",
              background: "#fef3c7",
              borderRadius: "8px",
              borderLeft: "4px solid #f59e0b",
            }}
          >
            <strong>Kurangi personal time</strong>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              Misal: 12:00 - 12:30
            </div>
          </div>
          <div
            style={{
              padding: "12px",
              background: "#f0fdf4",
              borderRadius: "8px",
              borderLeft: "4px solid #48bb78",
            }}
          >
            <strong>Tingkatkan max productive</strong>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              Misal: dari 360 → 420 menit
            </div>
          </div>
          <div
            style={{
              padding: "12px",
              background: "#fce7f3",
              borderRadius: "8px",
              borderLeft: "4px solid #ec4899",
            }}
          >
            <strong>Kurangi durasi aktivitas</strong>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              Fokus pada yang prioritas
            </div>
          </div>
        </div>
      </div>

      <div className="invalid-actions">
        <button
          className="btn-primary"
          onClick={() => router.push("/study-plan/daily")}
        >
          <InlineIcon name="arrow-left" size={20} className="mr-2" />
          Kembali & Perbaiki Input
        </button>
      </div>
    </div>
  );
}