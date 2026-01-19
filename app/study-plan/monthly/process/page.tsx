"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { runScheduler } from "@/lib/scheduler";
import ProgressBar from "@/ui/ProgressBar";

export default function MonthlyProcessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("Memuat data...");

  useEffect(() => {
    const run = async () => {
      const raw = sessionStorage.getItem("monthlyScheduleData");
      if (!raw) return router.push("/study-plan/monthly");

      setStep("Mengurutkan proyek (Greedy Dominan)");
      setProgress(40);
      await delay(800);

      setStep("Memeriksa tanggal terblokir");
      setProgress(60);
      await delay(800);

      setStep("Distribusi jam bulanan");
      setProgress(80);
      await delay(1000);

      const result = await runScheduler("monthly", JSON.parse(raw));
      sessionStorage.setItem("monthlyScheduleResult", JSON.stringify(result));

      setProgress(100);
      router.push(
        result.success
          ? "/study-plan/monthly/result"
          : "/study-plan/monthly/invalid"
      );
    };

    run();
  }, []);

  return (
    <div className="process-container">
      <div className="process-content">
        <div className="process-icon">⚙️</div>
        <h1>Memproses Jadwal Bulanan</h1>
        <ProgressBar progress={progress} currentStep={step} />
      </div>
    </div>
  );
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
