"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WeeklyConfig, WeeklyTask } from "@/lib/types";
import { validateWeeklyInput } from "@/lib/scheduler";

export default function WeeklyInputPage() {
  const router = useRouter();

  // Config state
  const [config, setConfig] = useState<WeeklyConfig>({
    startDate: new Date().toISOString().split("T")[0],
    maxHoursPerWeek: 20,
    activeDays: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
    weeks: 2,
  });

  // Tasks state
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [newTask, setNewTask] = useState({
    name: "",
    duration: 6,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const allDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // ✅ FIXED: Safe parseInt
  const safeParseInt = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
  };

  const handleDayToggle = (day: string) => {
    const newActiveDays = config.activeDays.includes(day)
      ? config.activeDays.filter((d) => d !== day)
      : [...config.activeDays, day];
    setConfig({ ...config, activeDays: newActiveDays });
  };

  const handleAddTask = () => {
    if (newTask.name && newTask.duration > 0 && newTask.deadline) {
      setTasks([...tasks, newTask]);
      setNewTask({
        name: "",
        duration: 6,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
    }
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    const validation = validateWeeklyInput(config, tasks);

    if (!validation.valid) {
      alert(validation.errors.join("\n"));
      return;
    }

    // Store in sessionStorage
    sessionStorage.setItem(
      "weeklyScheduleData",
      JSON.stringify({ config, tasks })
    );

    router.push("/study-plan/weekly/process");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
    ];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <div className="input-container">
      <div className="input-header">
        <h1>📅 WEEKLY SCHEDULE</h1>
        <p>Distribusi beban belajar mingguan yang seimbang</p>
      </div>

      {/* Periode */}
      <div className="input-section">
        <h3>📆 Periode Penjadwalan</h3>
        <div className="input-row">
          <div className="input-group">
            <label>Tanggal Mulai</label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) =>
                setConfig({ ...config, startDate: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label>Jumlah Minggu</label>
            <input
              type="number"
              value={config.weeks}
              onChange={(e) =>
                setConfig({ 
                  ...config, 
                  weeks: safeParseInt(e.target.value, 2)
                })
              }
              min="1"
              max="8"
            />
          </div>
        </div>
      </div>

      {/* Hari Aktif */}
      <div className="input-section">
        <h3>📋 Hari Aktif Belajar</h3>
        <div className="days-selector">
          {allDays.map((day) => (
            <label key={day} className="day-checkbox">
              <input
                type="checkbox"
                checked={config.activeDays.includes(day)}
                onChange={() => handleDayToggle(day)}
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
        <p className="note">
          Pilih hari-hari yang tersedia untuk belajar/mengerjakan tugas
        </p>
      </div>

      {/* Kapasitas */}
      <div className="input-section">
        <h3>⚡ Kapasitas Belajar</h3>
        <div className="input-group">
          <label>Max Jam per Minggu</label>
          <input
            type="number"
            value={config.maxHoursPerWeek}
            onChange={(e) =>
              setConfig({
                ...config,
                maxHoursPerWeek: safeParseInt(e.target.value, 20)
              })
            }
            min="5"
            max="40"
          />
          <p className="note">
            Rekomendasi: 15-25 jam per minggu untuk beban normal
          </p>
        </div>
      </div>

      {/* Tugas */}
      <div className="input-section">
        <h3>📝 Daftar Tugas</h3>

        {/* Task List */}
        <div className="task-list">
          {tasks.map((task, index) => (
            <div key={index} className="task-item-weekly">
              <div className="task-main">
                <div className="task-info">
                  <strong>{task.name}</strong>
                </div>
                <button
                  className="chip-remove"
                  onClick={() => handleRemoveTask(index)}
                >
                  ×
                </button>
              </div>
              <div className="task-details">
                <span>⏱️ {task.duration} jam</span>
                <span>📅 Deadline: {formatDate(task.deadline)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Task */}
        <div className="input-row">
          <div className="input-group">
            <label>Nama Tugas</label>
            <input
              type="text"
              value={newTask.name}
              onChange={(e) =>
                setNewTask({ ...newTask, name: e.target.value })
              }
              placeholder="e.g., Tugas DAA"
            />
          </div>
          <div className="input-group">
            <label>Estimasi Durasi (jam)</label>
            <input
              type="number"
              value={newTask.duration}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  duration: safeParseInt(e.target.value, 6)
                })
              }
              min="1"
              max="40"
            />
          </div>
        </div>

        <div className="input-group">
          <label>Deadline</label>
          <input
            type="date"
            value={newTask.deadline}
            onChange={(e) =>
              setNewTask({ ...newTask, deadline: e.target.value })
            }
            min={config.startDate}
          />
        </div>

        <button className="btn-add" onClick={handleAddTask}>
          + Tambah Tugas
        </button>
      </div>

      {/* Summary */}
      {tasks.length > 0 && (
        <div className="input-section">
          <div
            style={{
              background: "#fff",
              padding: "16px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "#888" }}>Total Tugas</div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                {tasks.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888" }}>Total Jam</div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                {tasks.reduce((sum, t) => sum + t.duration, 0)} jam
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                Rata-rata/Minggu
              </div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                {Math.ceil(
                  tasks.reduce((sum, t) => sum + t.duration, 0) / config.weeks
                )}{" "}
                jam
              </div>
            </div>
          </div>
        </div>
      )}

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
          disabled={tasks.length === 0}
        >
          Generate Jadwal →
        </button>
      </div>
    </div>
  );
}