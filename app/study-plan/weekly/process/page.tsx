"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/ui/ProgressBar";
import { runScheduler } from "@/lib/scheduler";

export default function WeeklyProcessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Memuat data...");

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

      // Step 2: Sorting by deadline
      setCurrentStep("Mengurutkan tugas berdasarkan deadline (Greedy)...");
      setProgress(30);
      await sleep(900);

      // Step 3: Calculate weeks
      setCurrentStep("Menghitung distribusi mingguan...");
      setProgress(50);
      await sleep(1000);

      // Step 4: Backtracking
      setCurrentStep("Mencari distribusi optimal (Backtracking)...");
      setProgress(70);
      await sleep(1100);

      // Step 5: API Call
      setCurrentStep("Menghasilkan jadwal mingguan...");
      setProgress(85);

      const result = await runScheduler("weekly", { config, tasks });

      setProgress(100);
      await sleep(500);

      // Store result
      sessionStorage.setItem("weeklyScheduleResult", JSON.stringify(result));

      // Navigate
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
        <div className="process-icon">⚙️</div>
        <h1>Processing Weekly Schedule</h1>

        <ProgressBar progress={progress} currentStep={currentStep} />

        <div className="process-info">
          <div className="info-item">
            <span className="info-label">Algorithm</span>
            <span className="info-value">Greedy + Backtracking</span>
          </div>
          <div className="info-item">
            <span className="info-label">Mode</span>
            <span className="info-value">Weekly</span>
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