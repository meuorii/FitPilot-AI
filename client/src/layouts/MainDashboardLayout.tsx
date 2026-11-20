import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppTopNav } from "../components/layout/AppTopNav";

export interface DashboardLayoutContext {
  openSidebar: () => void;
}

export function MainDashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-app min-h-screen bg-[#F5F3F6] text-[#38323F]">
      <AppTopNav
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((open) => !open)}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className="dashboard-main min-w-0">
        <div className="dashboard-container mx-auto w-full">
          <Outlet context={{ openSidebar: () => setMobileOpen(true) } satisfies DashboardLayoutContext} />
        </div>
      </main>
    </div>
  );
}
