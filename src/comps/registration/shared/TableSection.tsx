import { ReactNode } from "react";

interface TableSectionProps {
  children: ReactNode;
  className?: string;
}

export default function TableSection({ children, className = "" }: TableSectionProps) {
  return (
    <div
      className={`table-section mt-6 rounded-2xl px-5 py-2 pb-4 bg-white border border-gray-200 shadow-xs ${className}`}
    >
      {children}
    </div>
  );
}
