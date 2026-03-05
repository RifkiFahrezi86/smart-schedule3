"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WarningIcon, BlockIcon, LightbulbIcon, InfoIcon, InlineIcon } from "@/components/Icon";
import Loading from "@/components/Loading";
import type { WeeklyResult } from "@/lib/types";

export default function WeeklyInvalidPage() {
  const router = useRouter();
  const [result, setResult] = useState<WeeklyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem("weeklyScheduleResult");
    if (!data) {
      router.push("/study-plan/weekly");
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

      {/* Common Issues */}
      <div className="suggestion-box">
        <h3>
          <InfoIcon size={24} className="mr-2" />
          Kemungkinan Penyebab:
        </h3>
        <ul>
          <li>
            <strong>Total jam terlalu besar:</strong> Jumlah jam semua tugas
            melebihi kapasitas mingguan × jumlah minggu
          </li>
          <li>
            <strong>Deadline terlalu dekat:</strong> Beberapa tugas memiliki
            deadline sebelum jadwal dimulai
          </li>
          <li>
            <strong>Hari aktif terlalu sedikit:</strong> Tidak cukup hari untuk
            mendistribusikan semua tugas
          </li>
          <li>
            <strong>Kapasitas per minggu terlalu kecil:</strong> Max jam per
            minggu tidak cukup untuk menampung tugas
          </li>
        </ul>
      </div>

      {/* Example Fix */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
        }}
      >
        <h3 style={{ marginBottom: "12px", fontSize: "18px" }}>
          ✏️ Contoh Perbaikan:
        </h3>
        <div style={{ display: "grid", gap: "8px", fontSize: "14px" }}>
          <div>
            • Jika total tugas 60 jam untuk 2 minggu, set max jam/minggu minimal{" "}
            <strong>30 jam</strong>
          </div>
          <div>
            • Pastikan deadline tugas{" "}
            <strong>setelah tanggal mulai penjadwalan</strong>
          </div>
          <div>
            • Pilih minimal <strong>5-6 hari aktif</strong> untuk fleksibilitas
          </div>
          <div>
            • Untuk beban berat, pertimbangkan menambah{" "}
            <strong>jumlah minggu</strong>
          </div>
        </div>
      </div>

      <div className="invalid-actions">
        <button
          className="btn-primary"
          onClick={() => router.push("/study-plan/weekly")}
        >
          <InlineIcon name="arrow-left" size={20} className="mr-2" />
          Kembali & Perbaiki Input
        </button>
      </div>
    </div>
  );
}