"use client";

import { useEffect, useState } from "react";

function formatRelative(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "recently";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);

  if (seconds < 45) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export default function TimeAgo({ date, className }) {
  const [label, setLabel] = useState(null);

  useEffect(() => {
    const update = () => setLabel(formatRelative(date));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <span className={className} suppressHydrationWarning>
      {label ?? formatRelative(date)}
    </span>
  );
}
