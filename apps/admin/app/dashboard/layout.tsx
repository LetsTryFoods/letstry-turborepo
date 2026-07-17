import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { AppNavbar } from "./components/app-navbar";
import { GlobalSupportSocket } from "./components/GlobalSupportSocket";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Global WhatsApp support socket — stays alive on every page */}
      <GlobalSupportSocket />
      <Toaster position="top-right" richColors />
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <AppNavbar />
        <main className="flex-1">
          <div className="p-4">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
