// app/study-plan/monthly/invalid/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WarningIcon, BlockIcon, LightbulbIcon, InfoIcon, InlineIcon } from "@/components/Icon";
import type { MonthlyResult } from "@/lib/types";

export default function MonthlyInvalidPage() {
  const router = useRouter();
  const [result, setResult] = useState<MonthlyResult | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("monthlyScheduleResult");
    if (!data) {
      router.push("/study-plan/monthly");
      return;
    }

    const parsed = JSON.parse(data);
    setResult(parsed);
  }, [router]);

  if (!result) {
    return (
      <div className="loading-container">
        <div className="spinner">⚙️</div>
        <div className="loading-text">Loading...</div>
      </div>
    );
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

      {/* Common Issues */}
      <div className="suggestion-box">
        <h3>
          <InfoIcon size={24} className="mr-2" />
          Kemungkinan Penyebab:
        </h3>
        <ul>
          <li>
            <strong>Total jam melebihi kapasitas bulanan:</strong> Jumlah jam
            semua proyek lebih besar dari max jam/bulan yang ditentukan
          </li>
          <li>
            <strong>Deadline tidak realistis:</strong> Deadline proyek sebelum
            tanggal yang cukup untuk menyelesaikannya
          </li>
          <li>
            <strong>Terlalu banyak tanggal terblokir:</strong> Hari produktif
            yang tersisa tidak cukup untuk semua proyek
          </li>
          <li>
            <strong>Proyek terlalu besar:</strong> Satu proyek membutuhkan waktu
            lebih dari kapasitas yang tersedia
          </li>
        </ul>
      </div>

      {/* Calculation Example */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
        }}
      >
        <h3 style={{ marginBottom: "16px", fontSize: "18px" }}>
          📊 Contoh Perhitungan:
        </h3>
        <div
          style={{
            background: "#f0fdf4",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "12px",
            border: "2px solid #48bb78",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#166534" }}>Skenario 1 - VALID ✅</strong>
          </div>
          <div style={{ fontSize: "14px", color: "#444", lineHeight: "1.8" }}>
            • Max jam/bulan: <strong>80 jam</strong>
            <br />
            • Proyek A: 30 jam (deadline tgl 15)
            <br />
            • Proyek B: 25 jam (deadline tgl 25)
            <br />
            • Proyek C: 20 jam (deadline tgl 31)
            <br />
            • Total: 75 jam ≤ 80 jam ✓<br />
            • Tanggal terblokir: 3 hari (masih ada 28 hari produktif) ✓
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
          <div style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#991b1b" }}>Skenario 2 - INVALID ❌</strong>
          </div>
          <div style={{ fontSize: "14px", color: "#444", lineHeight: "1.8" }}>
            • Max jam/bulan: <strong>60 jam</strong>
            <br />
            • Proyek A: 35 jam (deadline tgl 10) ❌ terlalu cepat
            <br />
            • Proyek B: 30 jam (deadline tgl 20)
            <br />
            • Proyek C: 25 jam (deadline tgl 31)
            <br />
            • Total: 90 jam &gt; 60 jam ❌<br />
            • Tanggal terblokir: 15 hari (hanya 16 hari produktif) ❌
          </div>
        </div>
      </div>

      {/* Quick Fixes */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
        }}
      >
        <h3 style={{ marginBottom: "12px", fontSize: "18px" }}>
          ✏️ Quick Fixes:
        </h3>
        <div style={{ display: "grid", gap: "12px" }}>
          <div
            style={{
              padding: "12px",
              background: "#f0f9ff",
              borderRadius: "8px",
              borderLeft: "4px solid #3b82f6",
            }}
          >
            <strong>Jika total jam terlalu besar:</strong>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>
              Naikkan max jam/bulan ATAU kurangi estimasi durasi proyek ATAU
              perpanjang ke 2 bulan
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
            <strong>Jika deadline terlalu ketat:</strong>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>
              Mundurkan deadline proyek ATAU mulai penjadwalan lebih awal
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
            <strong>Jika terlalu banyak hari terblokir:</strong>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>
              Kurangi tanggal terblokir yang tidak terlalu penting
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
            <strong>Distribusi proyek:</strong>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>
              Pecah proyek besar menjadi fase-fase yang lebih kecil
            </div>
          </div>
        </div>
      </div>

      {/* Visual Timeline */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
        }}
      >
        <h3 style={{ marginBottom: "16px", fontSize: "18px" }}>
          📅 Visualisasi Kapasitas:
        </h3>
        
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
            Contoh: 80 jam untuk 4 minggu
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[20, 20, 20, 20].map((hours, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#f0f9ff",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: "2px solid #3b82f6",
                }}
              >
                <div style={{ fontSize: "12px", color: "#666" }}>Minggu {i + 1}</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#3b82f6" }}>
                  {hours}h
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: "13px", color: "#666", fontStyle: "italic" }}>
          💡 Tip: Distribusikan proyek secara merata untuk menghindari overload pada minggu tertentu
        </div>
      </div>

      <div className="invalid-actions">
        <button
          className="btn-primary"
          onClick={() => router.push("/study-plan/monthly")}
        >
          <InlineIcon name="arrow-left" size={20} className="mr-2" />
          Kembali & Perbaiki Input
        </button>
      </div>
    </div>
  );
}