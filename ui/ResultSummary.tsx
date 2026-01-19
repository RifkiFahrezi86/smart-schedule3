interface SummaryItem {
  label: string;
  value: string | number;
}

interface ResultSummaryProps {
  items: SummaryItem[];
}

export default function ResultSummary({ items }: ResultSummaryProps) {
  return (
    <div className="result-summary">
      {items.map((item, idx) => (
        <div key={idx} className="summary-card">
          <span className="summary-label">{item.label}</span>
          <span className="summary-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}