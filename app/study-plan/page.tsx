import Link from "next/link";

export default function StudyPlanPage() {
  return (
    <div className="study-plan-container">
      <h1 className="study-plan-title">SMART SCHEDULING</h1>
      <p className="study-plan-subtitle">
        Pilih jenis penjadwalan sesuai kebutuhan belajar Anda
      </p>

      <div className="schedule-options">
        <Link href="/study-plan/daily" className="schedule-card">
          <div className="schedule-icon">
            <img src="/icons/daily.svg" />
          </div>
          <h2>DAILY</h2>
          <p>Penjadwalan detail per hari</p>
        </Link>

        <Link href="/study-plan/weekly" className="schedule-card">
          <div className="schedule-icon">
            <img src="/icons/weekly.svg" />
          </div>
          <h2>WEEKLY</h2>
          <p>Distribusi beban mingguan</p>
        </Link>

        <Link href="/study-plan/monthly" className="schedule-card">
          <div className="schedule-icon">
            <img src="/icons/monthly.svg" />
          </div>
          <h2>MONTHLY</h2>
          <p>Perencanaan proyek jangka panjang</p>
        </Link>
      </div>
    </div>
  );
}
