"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/ui/ProgressBar";
import { runScheduler } from "@/lib/scheduler";
import { InlineIcon } from "@/components/Icon";

export default function DailyProcessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Memuat data...");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    processSchedule();
  }, []);

  const processSchedule = async () => {
    try {
      const data = sessionStorage.getItem("dailyScheduleData");
      if (!data) {
        router.push("/study-plan/daily");
        return;
      }

      const { config, activities } = JSON.parse(data);

      // Step 1: Validasi
      setCurrentStep("Validasi input data...");
      setProgress(20);
      await sleep(700);

      // Step 2: Greedy sorting
      setCurrentStep("Mengurutkan aktivitas (Greedy)...");
      setProgress(40);
      await sleep(900);

      // Step 3: Backtracking
      setCurrentStep("Mencari kombinasi optimal (Backtracking)...");
      setProgress(65);
      await sleep(1100);

      // Step 4: Generate
      setCurrentStep("Menghasilkan jadwal harian...");
      setProgress(85);

      const result = await runScheduler("daily", { config, activities });

      setProgress(100);
      setIsComplete(true);
      await sleep(500);

      sessionStorage.setItem("dailyScheduleResult", JSON.stringify(result));

      if (result.success) {
        router.push("/study-plan/daily/result");
      } else {
        router.push("/study-plan/daily/invalid");
      }
    } catch (error) {
      console.error("Daily process error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
      router.push("/study-plan/daily");
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
        <h1>Processing Daily Schedule</h1>

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
              <InlineIcon name="clock" size={16} /> MODE
            </span>
            <span className="info-value">Daily</span>
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