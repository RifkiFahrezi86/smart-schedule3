export default function Header() {
  return (
    <header
      style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontWeight: 600 }}>January 2026</span>
      <button className="btn-primary">+ Add Event</button>
    </header>
  );
}
