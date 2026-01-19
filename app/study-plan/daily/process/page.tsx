"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/ui/ProgressBar";
import { runScheduler } from "@/lib/scheduler";

export default function DailyProcessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Memuat data...");

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
      await sleep(800);

      // Step 2: Sorting
      setCurrentStep("Mengurutkan aktivitas (Greedy Algorithm)...");
      setProgress(40);
      await sleep(1000);

      // Step 3: Backtracking
      setCurrentStep("Mencari kombinasi optimal (Backtracking)...");
      setProgress(60);
      await sleep(1200);

      // Step 4: API Call
      setCurrentStep("Menghasilkan jadwal final...");
      setProgress(80);

      const result = await runScheduler("daily", { config, activities });

      setProgress(100);
      await sleep(500);

      // Store result
      sessionStorage.setItem("dailyScheduleResult", JSON.stringify(result));

      // Navigate to result or invalid
      if (result.success) {
        router.push("/study-plan/daily/result");
      } else {
        router.push("/study-plan/daily/invalid");
      }
    } catch (error) {
      console.error("Process error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
      router.push("/study-plan/daily");
    }
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  return (
    <div className="process-container">
      <div className="process-content">
        <div className="process-icon">⚙️</div>
        <h1>Processing Schedule</h1>

        <ProgressBar progress={progress} currentStep={currentStep} />

        <div className="process-info">
          <div className="info-item">
            <span className="info-label">Algorithm</span>
            <span className="info-value">Greedy + Backtracking</span>
          </div>
          <div className="info-item">
            <span className="info-label">Mode</span>
            <span className="info-value">Daily</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status</span>
            <span className="info-value">
              {progress === 100 ? "Complete" : "Processing"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}