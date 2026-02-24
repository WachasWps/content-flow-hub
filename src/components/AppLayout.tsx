import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppLayout() {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className={`flex-1 overflow-y-auto ${isMobile ? "pt-14" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}
