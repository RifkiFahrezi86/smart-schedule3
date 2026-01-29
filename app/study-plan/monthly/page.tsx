"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MonthlyConfig, MonthlyTask } from "@/lib/types";
import { validateMonthlyInput } from "@/lib/scheduler";
import { InlineIcon } from "@/components/Icon";

export default function MonthlyInputPage() {
  const router = useRouter();

  const [config, setConfig] = useState<MonthlyConfig>({
    startDate: new Date().toISOString().split("T")[0],
    maxHoursPerMonth: 80,
    blockedDates: [],
  });

  const [tasks, setTasks] = useState<MonthlyTask[]>([]);
  const [newTask, setNewTask] = useState({
    name: "",
    duration: 10,
    deadline: 31,
  });

  const [newBlockedDate, setNewBlockedDate] = useState(1);

  const safeParseInt = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
  };

  const handleAddBlockedDate = () => {
    if (
      newBlockedDate >= 1 &&
      newBlockedDate <= 31 &&
      !config.blockedDates.includes(newBlockedDate)
    ) {
      setConfig({
        ...config,
        blockedDates: [...config.blockedDates, newBlockedDate].sort(
          (a, b) => a - b
        ),
      });
      setNewBlockedDate(newBlockedDate + 1);
    }
  };

  const handleRemoveBlockedDate = (date: number) => {
    setConfig({
      ...config,
      blockedDates: config.blockedDates.filter((d) => d !== date),
    });
  };

  const handleAddTask = () => {
    if (newTask.name && newTask.duration > 0 && newTask.deadline > 0) {
      setTasks([...tasks, newTask]);
      setNewTask({
        name: "",
        duration: 10,
        deadline: 31,
      });
    }
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    const validation = validateMonthlyInput(config, tasks);

    if (!validation.valid) {
      alert(validation.errors.join("\n"));
      return;
    }

    sessionStorage.setItem(
      "monthlyScheduleData",
      JSON.stringify({ config, tasks })
    );

    router.push("/study-plan/monthly/process");
  };

  const getMonthName = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="input-container">
      <div className="input-header">
        <h1>
          <InlineIcon name="bar-chart" size={32} className="mr-2" />
          MONTHLY SCHEDULE
        </h1>
        <p>Perencanaan proyek dan tugas besar jangka panjang</p>
      </div>

      {/* Periode */}
      <div className="input-section">
        <h3>
          <InlineIcon name="calendar" size={20} className="mr-2" />
          Bulan Penjadwalan
        </h3>
        <div className="input-group">
          <label>Pilih Bulan</label>
          <input
            type="date"
            value={config.startDate}
            onChange={(e) =>
              setConfig({ ...config, startDate: e.target.value })
            }
          />
          <p className="note">
            Bulan yang dipilih: <strong>{getMonthName(config.startDate)}</strong>
          </p>
        </div>
      </div>

      {/* Kapasitas */}
      <div className="input-section">
        <h3>
          <InlineIcon name="zap" size={20} className="mr-2" />
          Kapasitas Bulanan
        </h3>
        <div className="input-group">
          <label>Max Jam per Bulan</label>
          <input
            type="number"
            value={config.maxHoursPerMonth}
            onChange={(e) =>
              setConfig({
                ...config,
                maxHoursPerMonth: safeParseInt(e.target.value, 80)
              })
            }
            min="20"
            max="200"
          />
          <p className="note">
            Rekomendasi: 60-100 jam per bulan untuk beban normal
          </p>
        </div>
      </div>

      {/* Tanggal Terblokir */}
      <div className="input-section">
        <h3>
          <InlineIcon name="x-circle" size={20} className="mr-2" />
          Tanggal Tidak Tersedia
        </h3>

        <div className="blocked-dates">
          {config.blockedDates.length > 0 && (
            <div className="date-chips">
              {config.blockedDates.map((date) => (
                <div key={date} className="date-chip">
                  <span>Tanggal {date}</span>
                  <button
                    className="chip-remove"
                    onClick={() => handleRemoveBlockedDate(date)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="input-row">
            <div className="input-group">
              <label>Tambah Tanggal Terblokir</label>
              <input
                type="number"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(safeParseInt(e.target.value, 1))}
                min="1"
                max="31"
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn-add-small" onClick={handleAddBlockedDate}>
                + Tambah
              </button>
            </div>
          </div>
        </div>

        <p className="note">
          Tanggal libur, acara keluarga, atau hari tidak produktif
        </p>
      </div>

      {/* Proyek/Tugas */}
      <div className="input-section">
        <h3>
          <InlineIcon name="edit" size={20} className="mr-2" />
          Daftar Proyek & Tugas
        </h3>

        {/* Task List */}
        <div className="task-list">
          {tasks.map((task, index) => (
            <div key={index} className="task-item-monthly">
              <div className="task-header-monthly">
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
              <div className="task-meta">
                <span>
                  <InlineIcon name="clock" size={14} className="mr-1" />
                  {task.duration} jam
                </span>
                <span>
                  <InlineIcon name="calendar" size={14} className="mr-1" />
                  Deadline: Tanggal {task.deadline}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Task */}
        <div className="input-row">
          <div className="input-group">
            <label>Nama Proyek/Tugas</label>
            <input
              type="text"
              value={newTask.name}
              onChange={(e) =>
                setNewTask({ ...newTask, name: e.target.value })
              }
              placeholder="e.g., Proyek Besar Akhir Semester"
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
                  duration: safeParseInt(e.target.value, 10)
                })
              }
              min="1"
              max="100"
            />
          </div>
        </div>

        <div className="input-group">
          <label>Deadline (Tanggal dalam Bulan)</label>
          <input
            type="number"
            value={newTask.deadline}
            onChange={(e) =>
              setNewTask({ 
                ...newTask, 
                deadline: safeParseInt(e.target.value, 31)
              })
            }
            min="1"
            max="31"
          />
          <p className="note">Masukkan tanggal 1-31 untuk deadline tugas</p>
        </div>

        <button className="btn-add" onClick={handleAddTask}>
          + Tambah Proyek/Tugas
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
              <div style={{ fontSize: "12px", color: "#888" }}>
                Total Proyek
              </div>
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
                Hari Terblokir
              </div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                {config.blockedDates.length} hari
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