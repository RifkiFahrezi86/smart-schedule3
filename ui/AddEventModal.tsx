"use client";

import { useState } from "react";

interface AddEventModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSave: (eventData: any) => void;
}

export default function AddEventModal({
  isOpen,
  selectedDate,
  onClose,
  onSave,
}: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#ef4444");
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  if (!isOpen || !selectedDate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventData = {
      date: selectedDate.toISOString().split("T")[0],
      title,
      description,
      color,
      isAllDay,
      startTime: isAllDay ? null : startTime,
      endTime: isAllDay ? null : endTime,
    };

    onSave(eventData);
    
    // Reset form
    setTitle("");
    setDescription("");
    setColor("#ef4444");
    setIsAllDay(true);
    setStartTime("09:00");
    setEndTime("10:00");
  };

  const formatDate = (date: Date) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const colorOptions = [
    { value: "#ef4444", label: "Red (Deadline)" },
    { value: "#f59e0b", label: "Orange (Exam)" },
    { value: "#3b82f6", label: "Blue (Study)" },
    { value: "#8b5cf6", label: "Purple (Class)" },
    { value: "#10b981", label: "Green (Break)" },
    { value: "#6b7280", label: "Gray (Other)" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Important Date</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Selected Date Display */}
            <div className="form-group">
              <label>Selected Date</label>
              <div className="selected-date-display">
                📅 {formatDate(selectedDate)}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deadline Project DAA"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            {/* Color */}
            <div className="form-group">
              <label>Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)}>
                {colorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* All Day Checkbox */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                />
                All Day Event
              </label>
            </div>

            {/* Time Range (if not all day) */}
            {!isAllDay && (
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}