"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultSummary from "@/ui/ResultSummary";

export default function MonthlyResultPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("monthlyScheduleResult");
    if (!raw) return router.push("/study-plan/monthly");
    setData(JSON.parse(raw).data);
  }, []);

  if (!data) return null;

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="result-icon">✅</div>
        <h1>Jadwal Bulanan Selesai</h1>
      </div>

      <ResultSummary
        items={[
          { label: "Total Jam", value: `${data.totalHours} jam` },
          { label: "Rata-rata / Minggu", value: `${data.avgPerWeek} jam` },
          { label: "Hari Produktif", value: `${data.daysUsed} hari` },
        ]}
      />

      {data.weeks.map((w: any, i: number) => (
        <div key={i} className="calendar-week">
          <h4>{w.label}</h4>
          {w.tasks.map((t: any, j: number) => (
            <div key={j} className="calendar-task">
              <span>{t.date}</span>
              <span>{t.name}</span>
              <span>{t.hours} jam</span>
            </div>
          ))}
        </div>
      ))}

      <div className="result-actions">
        <button className="btn-secondary" onClick={() => router.back()}>
          ← Kembali
        </button>
        <button className="btn-primary">💾 Simpan</button>
      </div>
    </div>
  );
}
