"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/ui/ProgressBar";
import { runScheduler } from "@/lib/scheduler";

export default function MonthlyProcessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Memuat data...");

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

      // Step 6: API Call
      setCurrentStep("Menghasilkan jadwal bulanan...");
      setProgress(90);

      const result = await runScheduler("monthly", { config, tasks });

      setProgress(100);
      await sleep(500);

      // Store result
      sessionStorage.setItem("monthlyScheduleResult", JSON.stringify(result));

      // Navigate
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
        <div className="process-icon">⚙️</div>
        <h1>Processing Monthly Schedule</h1>

        <ProgressBar progress={progress} currentStep={currentStep} />

        <div className="process-info">
          <div className="info-item">
            <span className="info-label">Algorithm</span>
            <span className="info-value">Greedy + Backtracking</span>
          </div>
          <div className="info-item">
            <span className="info-label">Mode</span>
            <span className="info-value">Monthly</span>
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