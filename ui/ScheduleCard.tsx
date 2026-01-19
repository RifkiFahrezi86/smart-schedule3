import Link from "next/link";

interface ScheduleCardProps {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  features: string[];
}

export default function ScheduleCard({
  href,
  icon,
  title,
  subtitle,
  features
}: ScheduleCardProps) {
  return (
    <Link href={href} className="schedule-card">
      <div className="schedule-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="schedule-desc">
        {features.map((feature, idx) => (
          <span key={idx}>{feature}</span>
        ))}
      </div>
    </Link>
  );
}