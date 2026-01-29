"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/ui/ProgressBar";
import { runScheduler } from "@/lib/scheduler";
import { InlineIcon } from "@/components/Icon";

export default function MonthlyProcessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Memuat data...");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    processSchedule();
  }, []);

  const processSchedule = async () => {
    try {
      const data = sessionStorage.getItem("monthlyScheduleData");
      if (!data) {
        router.push("/study-plan/monthly");
        return;
      }

      const { config, tasks } = JSON.parse(data);

      // Step 1: Validasi
      setCurrentStep("Validasi input data...");
      setProgress(12);
      await sleep(700);

      // Step 2: Filter blocked dates
      setCurrentStep("Memfilter tanggal terblokir...");
      setProgress(25);
      await sleep(800);

      // Step 3: Sorting by deadline
      setCurrentStep("Mengurutkan proyek berdasarkan deadline (Greedy)...");
      setProgress(40);
      await sleep(900);

      // Step 4: Calculate distribution
      setCurrentStep("Menghitung distribusi bulanan...");
      setProgress(60);
      await sleep(1000);

      // Step 5: Backtracking
      setCurrentStep("Mencari penjadwalan optimal (Backtracking)...");
      setProgress(78);
      await sleep(1100);

      // Step 6: Generate
      setCurrentStep("Menghasilkan jadwal bulanan...");
      setProgress(90);

      const result = await runScheduler("monthly", { config, tasks });

      setProgress(100);
      setIsComplete(true);
      await sleep(500);

      sessionStorage.setItem("monthlyScheduleResult", JSON.stringify(result));

      if (result.success) {
        router.push("/study-plan/monthly/result");
      } else {
        router.push("/study-plan/monthly/invalid");
      }
    } catch (error) {
      console.error("Process error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
      router.push("/study-plan/monthly");
    }
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  return (
    <div className="process-container">
      <div className="process-content">

        {/* ICON LOADER */}
        <div className="process-icon">
          <InlineIcon name="loader" size={64} className="spin" />
        </div>

        {/* TITLE */}
        <h1>Processing Monthly Schedule</h1>

        {/* CURRENT STEP TEXT */}
        <div className="process-step">{currentStep}</div>

        {/* PROGRESS BAR */}
        <ProgressBar progress={progress} showPercentage={true} />

        {/* INFO */}
        <div className="process-info">
          <div className="info-item">
            <span className="info-label">
              <InlineIcon name="zap" size={16} /> ALGORITHM
            </span>
            <span className="info-value">Greedy + Backtracking</span>
          </div>

          <div className="info-item">
            <span className="info-label">
              <InlineIcon name="bar-chart" size={16} /> MODE
            </span>
            <span className="info-value">Monthly</span>
          </div>

          <div className="info-item">
            <span className="info-label">
              <InlineIcon name="loader" size={16} /> STATUS
            </span>
            <span className="info-value">
              {isComplete ? "Complete" : "Processing"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}