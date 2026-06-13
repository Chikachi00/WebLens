import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastState {
  type: ToastType;
  message: string;
}

const toastStyles: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  error: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
  info: "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
};

export function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(onDismiss, toast.type === "error" ? 6000 : 3200);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast]);

  if (!toast) {
    return null;
  }

  return (
    <div className={`rounded-md border p-3 text-sm shadow-sm ${toastStyles[toast.type]}`} role="status">
      {toast.message}
    </div>
  );
}
