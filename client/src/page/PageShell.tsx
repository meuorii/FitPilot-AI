import type { LucideIcon } from "lucide-react";
import { Menu } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { DashboardLayoutContext } from "../layouts/MainDashboardLayout";

interface PageShellProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PageShell({ title, description, icon: Icon }: PageShellProps) {
  const { openSidebar } = useOutletContext<DashboardLayoutContext>();

  return (
    <>
      <div className="mb-4 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={openSidebar}
          aria-label="Open navigation"
          className="rounded-xl border border-[#E4E1E6] bg-white p-2 text-[#38323F] shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold text-[#6F6973]">FitPilot</span>
      </div>

      <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-8 shadow-[0_8px_30px_rgba(56,50,63,0.04)]">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
          <Icon className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-[#38323F]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#817B85]">{description}</p>
      </section>
    </>
  );
}
