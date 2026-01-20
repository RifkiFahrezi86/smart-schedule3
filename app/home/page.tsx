"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
  totalStudyHours: number;
  completedTasks: number;
  upcomingDeadlines: number;
  weeklyProgress: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudyHours: 0,
    completedTasks: 0,
    upcomingDeadlines: 0,
    weeklyProgress: 0,
  });
  const [recentSchedules, setRecentSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch schedules
      const schedulesRes = await fetch("/api/schedules");
      if (schedulesRes.ok) {
        const data = await schedulesRes.json();
        setRecentSchedules(data.schedules.slice(0, 5));

        // Calculate stats from schedules
        calculateStats(data.schedules);
      }

      // Fetch important dates
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const datesRes = await fetch(
        `/api/important-dates?start=${today.toISOString()}&end=${nextWeek.toISOString()}`
      );
      
      if (datesRes.ok) {
        const datesData = await datesRes.json();
        setStats((prev) => ({
          ...prev,
          upcomingDeadlines: datesData.dates?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (schedules: any[]) => {
    let totalHours = 0;
    let completedCount = 0;

    schedules.forEach((schedule) => {
      if (schedule.status === "success" && schedule.resultData?.data?.summary) {
        const summary = schedule.resultData.data.summary;

        // Calculate total hours
        if (schedule.scheduleType === "daily") {
          totalHours += (summary.totalProductive || 0) / 60; // Convert minutes to hours
        } else if (schedule.scheduleType === "weekly") {
          totalHours += summary.totalHours || 0;
        } else if (schedule.scheduleType === "monthly") {
          totalHours += summary.totalHours || 0;
        }

        completedCount++;
      }
    });

    // Calculate weekly progress (example: based on this week's schedules)
    const thisWeekSchedules = schedules.filter((s) => {
      const createdDate = new Date(s.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= weekAgo;
    });

    const weeklyProgress = thisWeekSchedules.length > 0 ? 75 : 0;

    setStats((prev) => ({
      ...prev,
      totalStudyHours: Math.round(totalHours * 10) / 10,
      completedTasks: completedCount,
      weeklyProgress,
    }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getScheduleIcon = (type: string) => {
    switch (type) {
      case "daily":
        return "⏰";
      case "weekly":
        return "📅";
      case "monthly":
        return "📊";
      default:
        return "📋";
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-container">
          <div className="spinner">⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header */}
      <div className="home-header">
        <h1 className="home-title">🎓 Dashboard</h1>
        <p className="home-subtitle">
          Welcome back! Here's your learning progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalStudyHours}h</div>
            <div className="stat-label">Study Hours</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedTasks}</div>
            <div className="stat-label">Completed Schedules</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.upcomingDeadlines}</div>
            <div className="stat-label">Upcoming Deadlines</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats.weeklyProgress}%</div>
            <div className="stat-label">Weekly Progress</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div className="action-buttons">
          <Link href="/study-plan/daily" className="action-btn">
            <span className="action-icon">⏰</span>
            <span>Create Daily Schedule</span>
          </Link>
          <Link href="/study-plan/weekly" className="action-btn">
            <span className="action-icon">📅</span>
            <span>Create Weekly Plan</span>
          </Link>
          <Link href="/study-plan/monthly" className="action-btn">
            <span className="action-icon">📊</span>
            <span>Create Monthly Plan</span>
          </Link>
          <Link href="/calendar" className="action-btn">
            <span className="action-icon">📆</span>
            <span>View Calendar</span>
          </Link>
        </div>
      </div>

      {/* Recent Schedules */}
      <div className="recent-schedules">
        <div className="section-header">
          <h2>📋 Recent Schedules</h2>
          <Link href="/study-plan" className="view-all-link">
            View All →
          </Link>
        </div>

        {recentSchedules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No schedules yet</h3>
            <p>Create your first schedule to get started!</p>
            <Link href="/study-plan" className="btn-primary">
              Create Schedule
            </Link>
          </div>
        ) : (
          <div className="schedule-list">
            {recentSchedules.map((schedule) => (
              <div key={schedule.id} className="schedule-item">
                <div className="schedule-icon">
                  {getScheduleIcon(schedule.scheduleType)}
                </div>
                <div className="schedule-info">
                  <h3>{schedule.title}</h3>
                  <div className="schedule-meta">
                    <span className="schedule-type">
                      {schedule.scheduleType.charAt(0).toUpperCase() +
                        schedule.scheduleType.slice(1)}
                    </span>
                    <span className="schedule-date">
                      {formatDate(schedule.createdAt)}
                    </span>
                  </div>
                </div>
                <div
                  className={`schedule-status ${
                    schedule.status === "success" ? "success" : "failed"
                  }`}
                >
                  {schedule.status === "success" ? "✓ Success" : "✗ Failed"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}