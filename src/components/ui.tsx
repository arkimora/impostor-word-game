import type { PropsWithChildren } from "react";
import { cn } from "../utils/cn";

type ButtonProps = PropsWithChildren<{
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
}>;

export const Page = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <main className={cn("mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-8", className)}>{children}</main>
);

export const SectionTitle = ({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) => (
  <header className="mb-6">
    <div className="flex items-center gap-3">
      {onBack ? (
        <button
          onClick={onBack}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-base text-slate-600 ring-1 ring-slate-200"
          aria-label="Back"
        >
          <span aria-hidden>←</span>
        </button>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
    </div>
    {subtitle ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{subtitle}</p> : null}
  </header>
);

export const Button = ({
  children,
  onClick,
  variant = "primary",
  disabled,
  className,
  type = "button",
}: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "h-12 w-full rounded-2xl px-4 text-base font-medium transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45",
      variant === "primary" && "bg-slate-900 text-white shadow-sm",
      variant === "secondary" && "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200",
      variant === "ghost" && "bg-transparent text-slate-700 ring-1 ring-slate-200",
      variant === "danger" && "bg-red-600 text-white",
      className
    )}
  >
    {children}
  </button>
);

export const Input = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <input
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    className={cn(
      "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400",
      className
    )}
  />
);

export const Chip = ({
  active,
  onClick,
  children,
}: PropsWithChildren<{ active: boolean; onClick: () => void }>) => (
  <button
    onClick={onClick}
    className={cn(
      "h-10 rounded-xl px-4 text-sm font-medium transition",
      active ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
    )}
  >
    {children}
  </button>
);

export const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    aria-pressed={checked}
    className={cn(
      "relative h-7 w-12 rounded-full transition",
      checked ? "bg-slate-900" : "bg-slate-300"
    )}
  >
    <span
      className={cn(
        "absolute top-1 h-5 w-5 rounded-full bg-white transition",
        checked ? "left-6" : "left-1"
      )}
    />
  </button>
);

export const InlineMessage = ({ message }: { message: string | null }) =>
  message ? <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null;