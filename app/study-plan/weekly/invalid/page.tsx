"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { runScheduler } from "@/lib/scheduler";
import ProgressBar from "@/ui/ProgressBar";

export default function WeeklyProcessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("Memuat data...");

  useEffect(() => {
    const run = async () => {
      const raw = sessionStorage.getItem("weeklyScheduleData");
      if (!raw) return router.push("/study-plan/weekly");

      setStep("Mengurutkan tugas (Greedy Deadline)");
      setProgress(40);
      await delay(800);

      setStep("Optimasi distribusi (Backtracking)");
      setProgress(70);
      await delay(1000);

      const result = await runScheduler("weekly", JSON.parse(raw));
      sessionStorage.setItem("weeklyScheduleResult", JSON.stringify(result));

      setProgress(100);
      router.push(result.success
        ? "/study-plan/weekly/result"
        : "/study-plan/weekly/invalid"
      );
    };

    run();
  }, []);

  return (
    <div className="process-container">
      <div className="process-content">
        <div className="process-icon">⚙️</div>
        <h1>Memproses Jadwal Mingguan</h1>
        <ProgressBar progress={progress} currentStep={step} />
      </div>
    </div>
  );
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
