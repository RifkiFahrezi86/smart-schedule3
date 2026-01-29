"use client";

import { useState, useEffect } from "react";
import CalendarView from "@/ui/CalendarView";
import AddEventModal from "@/ui/AddEventModal";
import { LoadingSpinner } from "@/components/Loading";
import type { ImportantDate } from "@/lib/types";
import Image from "next/image";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchImportantDates();
  }, [currentMonth]);

  const fetchImportantDates = async () => {
    setLoading(true);

    const startDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    const endDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    try {
      const response = await fetch(
        `/api/important-dates?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch important dates");
      }

      const data = await response.json();
      setImportantDates(data.dates || []);
    } catch (error) {
      console.error("Fetch important dates failed:", error);
      setImportantDates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      const response = await fetch("/api/important-dates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to save event");
      }

      // Refresh calendar
      await fetchImportantDates();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save event failed:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header-bar">
        <h1 className="page-title">
          <Image 
            src="/icons/calendar.svg" 
            alt="Calendar" 
            width={42} 
            height={42}
            style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '12px' }}
          />
          Calendar
        </h1>
        <p className="page-subtitle">
          Tandai tanggal penting untuk deadline, ujian, dan acara lainnya
        </p>
      </div>

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner size="large" />
          <p className="loading-text">Loading calendar...</p>
        </div>
      ) : (
        <CalendarView
          importantDates={importantDates}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          onDateClick={handleDateClick}
        />
      )}

      {/* Event List */}
      <div className="upcoming-events">
        <h3>
          <Image 
            src="/icons/calendar.svg" 
            alt="" 
            width={24} 
            height={24}
            style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}
          />
          Upcoming Important Dates
        </h3>
        {importantDates.length === 0 ? (
          <p className="no-events">
            No important dates this month. Click on a date to add one!
          </p>
        ) : (
          <div className="event-list">
            {importantDates
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => (
                <div key={event.id} className="event-card">
                  <div
                    className="event-color-bar"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="event-details">
                    <div className="event-date">
                      {new Date(event.date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div className="event-title">{event.title}</div>
                    {event.description && (
                      <div className="event-description">{event.description}</div>
                    )}
                    {!event.isAllDay && (
                      <div className="event-time">
                        {event.startTime} - {event.endTime}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isModalOpen}
        selectedDate={selectedDate}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
      />
    </div>
  );
}