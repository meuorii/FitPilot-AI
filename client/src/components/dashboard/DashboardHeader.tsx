import { Bell, Menu, Search } from "lucide-react";
import type { DashboardUser } from "../../services/types/dashboard";

interface DashboardHeaderProps {
  user: DashboardUser;
  onOpenSidebar: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "FP";
}

export function DashboardHeader({ user, onOpenSidebar }: DashboardHeaderProps) {
  const firstName = getFirstName(user.full_name);

  return (
    <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="mt-1 rounded-xl border border-[#E4E1E6] bg-white p-2 text-[#38323F] shadow-sm lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#38323F] sm:text-3xl">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-[#7B7680]">Consistency today, stronger tomorrow.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative hidden min-w-0 flex-1 sm:block xl:w-[360px]">
          <span className="sr-only">Search FitPilot</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A95A0]" />
          <input
            type="search"
            placeholder="Search workouts, meals, or progress..."
            className="h-11 w-full rounded-2xl border border-[#E4E1E6] bg-white pl-11 pr-4 text-sm text-[#38323F] outline-none transition placeholder:text-[#AAA5AF] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/15"
          />
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-[#E4E1E6] bg-white text-[#5F5A64] transition hover:bg-[#F8F7F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          <Bell className="h-5 w-5" />
        </button>

        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={`${user.full_name} profile`}
            className="h-11 w-11 rounded-2xl border border-[#E4E1E6] object-cover"
          />
        ) : (
          <div
            aria-label={`${user.full_name} profile`}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[#7482A4] text-sm font-extrabold text-white shadow-sm"
          >
            {getInitials(user.full_name)}
          </div>
        )}
      </div>
    </header>
  );
}
