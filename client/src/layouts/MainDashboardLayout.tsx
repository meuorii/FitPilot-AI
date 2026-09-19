import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/layout/AppSidebar";

export interface DashboardLayoutContext {
  openSidebar: () => void;
}

export function MainDashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F3F6] text-[#38323F]">
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="min-w-0 px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-7">
        <div className="mx-auto w-full max-w-[1600px]">
          <Outlet context={{ openSidebar: () => setMobileOpen(true) } satisfies DashboardLayoutContext} />
        </div>
      </main>
    </div>
  );
}
