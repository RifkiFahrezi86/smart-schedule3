"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Timeline from "@/ui/Timeline";
import ResultSummary from "@/ui/ResultSummary";
import type { DailyResult } from "@/lib/types";

export default function DailyResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DailyResult | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("dailyScheduleResult");
    if (!data) {
      router.push("/study-plan/daily");
      return;
    }

    const parsed = JSON.parse(data);
    if (!parsed.success) {
      router.push("/study-plan/daily/invalid");
      return;
    }

    setResult(parsed);
  }, []);

  if (!result || !result.data) {
    return <div>Loading...</div>;
  }

  const { schedule, summary } = result.data;

  const summaryItems = [
    { label: "Total Productive", value: `${summary.totalProductive} min` },
    { label: "Break Time", value: `${summary.breakTime} min` },
    { label: "Personal Time", value: `${summary.personalTime} min` },
    { label: "End Time", value: summary.endTime },
  ];

  const handleSave = async () => {
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleType: "daily",
          title: "Daily Schedule",
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
        <h1>Jadwal Berhasil Dibuat!</h1>
        <p>Berikut adalah jadwal optimal untuk hari Anda</p>
      </div>

      <ResultSummary items={summaryItems} />

      <Timeline schedule={schedule} />

      <div className="result-actions">
        <button className="btn-secondary" onClick={() => router.push("/study-plan/daily")}>
          ← Buat Ulang
        </button>
        <button className="btn-primary" onClick={handleSave}>
          💾 Simpan Jadwal
        </button>
      </div>
    </div>
  );
}