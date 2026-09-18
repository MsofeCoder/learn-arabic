import * as React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
}

export function StatCard({ icon, label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <span className="flex size-9 items-center justify-center rounded-lg bg-sand-200 text-ink-600">
        {icon}
      </span>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-ink-900">
        {value}
      </p>
      <p className="mt-0.5 text-[13px] font-medium text-ink-700">{label}</p>
      <p className="mt-0.5 text-[12px] text-ink-400">{hint}</p>
    </div>
  );
}
