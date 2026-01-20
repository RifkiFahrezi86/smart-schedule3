"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DailyConfig, DailyActivity } from "@/lib/types";
import { validateDailyInput } from "@/lib/scheduler";

export default function DailyInputPage() {
  const router = useRouter();

  // Config state
  const [config, setConfig] = useState<DailyConfig>({
    startTime: "08:00",
    endTime: "16:00",
    personalStart: "12:00",
    personalEnd: "13:00",
    breakTime: 15,
    maxProductive: 360,
  });

  // Activities state
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [newActivity, setNewActivity] = useState({
    name: "",
    duration: 60,
    priority: "sedang" as "tinggi" | "sedang" | "rendah",
  });

  const handleAddActivity = () => {
    if (newActivity.name && newActivity.duration > 0) {
      setActivities([...activities, newActivity]);
      setNewActivity({
        name: "",
        duration: 60,
        priority: "sedang",
      });
    }
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    const validation = validateDailyInput(config, activities);
    
    if (!validation.valid) {
      alert(validation.errors.join("\n"));
      return;
    }

    // Store in sessionStorage
    sessionStorage.setItem(
      "dailyScheduleData",
      JSON.stringify({ config, activities })
    );

    router.push("/study-plan/daily/process");
  };

  const getPriorityClass = (priority: string) => {
    return `priority priority-${priority}`;
  };

  // ✅ FIXED: Safe parseInt with fallback
  const safeParseInt = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  return (
    <div className="input-container">
      <div className="input-header">
        <h1>⏰ DAILY SCHEDULE</h1>
        <p>Atur jadwal harian yang optimal untuk produktivitas maksimal</p>
      </div>

      {/* Waktu Aktif */}
      <div className="input-section">
        <h3>📅 Waktu Aktif</h3>
        <div className="input-row">
          <div className="input-group">
            <label>Start Time</label>
            <input
              type="time"
              value={config.startTime}
              onChange={(e) =>
                setConfig({ ...config, startTime: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label>End Time</label>
            <input
              type="time"
              value={config.endTime}
              onChange={(e) =>
                setConfig({ ...config, endTime: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Personal Time */}
      <div className="input-section">
        <h3>🍽️ Personal Time</h3>
        <div className="input-row">
          <div className="input-group">
            <label>Start Personal</label>
            <input
              type="time"
              value={config.personalStart}
              onChange={(e) =>
                setConfig({ ...config, personalStart: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label>End Personal</label>
            <input
              type="time"
              value={config.personalEnd}
              onChange={(e) =>
                setConfig({ ...config, personalEnd: e.target.value })
              }
            />
          </div>
        </div>
        <p className="note">
          Waktu untuk makan, istirahat, atau kegiatan pribadi
        </p>
      </div>

      {/* Produktivitas */}
      <div className="input-section">
        <h3>⚡ Produktivitas</h3>
        <div className="input-row">
          <div className="input-group">
            <label>Break Time (menit)</label>
            <input
              type="number"
              value={config.breakTime}
              onChange={(e) =>
                setConfig({ 
                  ...config, 
                  breakTime: safeParseInt(e.target.value, 15)
                })
              }
              min="5"
              max="30"
            />
          </div>
          <div className="input-group">
            <label>Max Productive Time (menit)</label>
            <input
              type="number"
              value={config.maxProductive}
              onChange={(e) =>
                setConfig({ 
                  ...config, 
                  maxProductive: safeParseInt(e.target.value, 360)
                })
              }
              min="60"
              max="600"
            />
          </div>
        </div>
        <p className="note">
          Break time diberikan setelah setiap aktivitas untuk menjaga fokus
        </p>
      </div>

      {/* Aktivitas */}
      <div className="input-section">
        <h3>📝 Aktivitas Harian</h3>

        {/* Activity List */}
        <div className="task-list">
          {activities.map((activity, index) => (
            <div key={index} className="task-item">
              <div className="task-info">
                <strong>{activity.name}</strong>
                <span>
                  {activity.duration} menit • {activity.priority}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={getPriorityClass(activity.priority)}>
                  {activity.priority.toUpperCase()}
                </span>
                <button
                  className="chip-remove"
                  onClick={() => handleRemoveActivity(index)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Activity */}
        <div className="input-row">
          <div className="input-group">
            <label>Nama Aktivitas</label>
            <input
              type="text"
              value={newActivity.name}
              onChange={(e) =>
                setNewActivity({ ...newActivity, name: e.target.value })
              }
              placeholder="e.g., Ngoding Web"
            />
          </div>
          <div className="input-group">
            <label>Durasi (menit)</label>
            <input
              type="number"
              value={newActivity.duration}
              onChange={(e) =>
                setNewActivity({
                  ...newActivity,
                  duration: safeParseInt(e.target.value, 60)
                })
              }
              min="15"
              max="240"
            />
          </div>
        </div>

        <div className="input-group">
          <label>Prioritas</label>
          <select
            value={newActivity.priority}
            onChange={(e) =>
              setNewActivity({
                ...newActivity,
                priority: e.target.value as any,
              })
            }
          >
            <option value="tinggi">Tinggi (urgent)</option>
            <option value="sedang">Sedang (normal)</option>
            <option value="rendah">Rendah (bisa nanti)</option>
          </select>
        </div>

        <button className="btn-add" onClick={handleAddActivity}>
          + Tambah Aktivitas
        </button>
      </div>

      {/* Actions */}
      <div className="input-actions">
        <button
          className="btn-secondary"
          onClick={() => router.push("/study-plan")}
        >
          ← Kembali
        </button>
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={activities.length === 0}
        >
          Generate Jadwal →
        </button>
      </div>
    </div>
  );
}