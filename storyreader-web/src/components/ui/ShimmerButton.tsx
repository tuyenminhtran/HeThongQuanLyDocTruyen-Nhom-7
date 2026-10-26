import React from "react";
import { cn } from "../../utils/cn";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  shimmerColor?: string;
  className?: string;
}

export default function ShimmerButton({
  children,
  className,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center p-[1px] overflow-hidden rounded-xl font-medium transition-all group active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {/* Vệt sáng chuyển động quanh viền */}
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#D97706_0%,#FDE68A_50%,#D97706_100%)]" />
      
      {/* Nội dung bên trong nút */}
      <span className="inline-flex items-center justify-center w-full h-full px-6 py-2.5 text-sm font-bold rounded-[11px] bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 transition-all group-hover:brightness-110">
        {children}
      </span>
    </button>
  );
}
