"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/ui/ProgressBar";
import { runScheduler } from "@/lib/scheduler";
import { InlineIcon } from "@/components/Icon";

export default function WeeklyProcessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Memuat data...");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    processSchedule();
  }, []);

  const processSchedule = async () => {
    try {
      const data = sessionStorage.getItem("weeklyScheduleData");
      if (!data) {
        router.push("/study-plan/weekly");
        return;
      }

      const { config, tasks } = JSON.parse(data);

      // Step 1: Validasi
      setCurrentStep("Validasi input data...");
      setProgress(15);
      await sleep(700);

      // Step 2: Sorting (Greedy)
      setCurrentStep("Mengurutkan tugas berdasarkan deadline (Greedy)...");
      setProgress(30);
      await sleep(900);

      // Step 3: Distribusi Mingguan
      setCurrentStep("Menghitung distribusi mingguan...");
      setProgress(50);
      await sleep(1000);

      // Step 4: Backtracking
      setCurrentStep("Mencari distribusi optimal (Backtracking)...");
      setProgress(70);
      await sleep(1100);

      // Step 5: Generate
      setCurrentStep("Menghasilkan jadwal mingguan...");
      setProgress(85);

      const result = await runScheduler("weekly", { config, tasks });

      setProgress(100);
      setIsComplete(true);
      await sleep(500);

      sessionStorage.setItem("weeklyScheduleResult", JSON.stringify(result));

      if (result.success) {
        router.push("/study-plan/weekly/result");
      } else {
        router.push("/study-plan/weekly/invalid");
      }
    } catch (error) {
      console.error("Process error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
      router.push("/study-plan/weekly");
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
        <h1>Processing Weekly Schedule</h1>

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
              <InlineIcon name="calendar" size={16} /> MODE
            </span>
            <span className="info-value">Weekly</span>
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