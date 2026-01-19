import CalendarView from "../../ui/CalendarView";

export default function HomePage() {
  return (
    <>
      {/* HEADER */}
      <div className="header">
        <strong>January 2026</strong>
        <button className="btn btn-primary">+ Add Event</button>
      </div>

      {/* CONTENT */}
      <div className="page-content">
        <CalendarView />
      </div>
    </>
  );
}
