"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { name: "HOME", href: "/home", icon: "/icons/home.svg" },
    { name: "CALLENDER", href: "/calendar", icon: "/icons/calendar.svg" },
    { name: "STUDY PLAN", href: "/study-plan", icon: "/icons/study.svg" },
  ];

  return (
    <aside className="sidebar">
      <nav className="menu">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`menu-item ${
              pathname.startsWith(item.href) ? "active" : ""
            }`}
          >
            <span>{item.name}</span>
            <img src={item.icon} alt={item.name} />
          </Link>
        ))}
      </nav>
    </aside>
  );
}
