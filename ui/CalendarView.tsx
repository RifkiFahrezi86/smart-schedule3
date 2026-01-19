"use client";

import { useState } from "react";
import type { ImportantDate } from "@/lib/types";

interface CalendarViewProps {
  importantDates: ImportantDate[];
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
  onDateClick: (date: Date) => void;
}

export default function CalendarView({
  importantDates,
  currentMonth,
  onMonthChange,
  onDateClick,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // Get days in month
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  // Get first day of month (0 = Sunday)
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Check if date has important event
  const getEventsForDay = (day: number) => {
    const dateStr = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    ).toISOString().split("T")[0];

    return importantDates.filter((event) => event.date === dateStr);
  };

  // Check if today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  // Month navigation
  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  // Format month year
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthYear = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="calendar-view">
      {/* Calendar Controls */}
      <div className="calendar-controls">
        <div className="month-nav">
          <button className="nav-btn" onClick={previousMonth}>
            ◀
          </button>
          <h2 className="month-title">{monthYear}</h2>
          <button className="nav-btn" onClick={nextMonth}>
            ▶
          </button>
        </div>

        <div className="view-switch">
          <button
            className={`view-btn ${viewMode === "month" ? "active" : ""}`}
            onClick={() => setViewMode("month")}
          >
            Month
          </button>
          <button
            className={`view-btn ${viewMode === "week" ? "active" : ""}`}
            onClick={() => setViewMode("week")}
          >
            Week
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Day Headers */}
        {dayHeaders.map((day) => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="day-cell empty" />;
          }

          const events = getEventsForDay(day);
          const today = isToday(day);

          return (
            <div
              key={day}
              className={`day-cell ${today ? "today" : ""}`}
              onClick={() => {
                const clickedDate = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day
                );
                onDateClick(clickedDate);
              }}
            >
              <div className="day-number">{day}</div>

              <div className="day-events">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="event"
                    style={{ backgroundColor: event.color }}
                    title={event.description || event.title}
                  >
                    <span className="event-title">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}