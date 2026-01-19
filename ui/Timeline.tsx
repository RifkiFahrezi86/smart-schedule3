import type { DailyScheduleItem } from "@/lib/types";

interface TimelineProps {
  schedule: DailyScheduleItem[];
}

export default function Timeline({ schedule }: TimelineProps) {
  return (
    <div className="schedule-timeline">
      <h3>📋 Timeline Jadwal</h3>
      {schedule.map((item, idx) => (
        <div key={idx} className="timeline-item">
          <div className="timeline-time">{item.time}</div>
          <div className="timeline-content">
            <div className="timeline-header">
              <strong>{item.activity}</strong>
              <span className="timeline-duration">{item.duration}</span>
            </div>
            <p className="timeline-reason">💡 {item.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}