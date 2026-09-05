import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function AppShell({
  sidebarOpen,
  setSidebarOpen,
  currentScreen,
  onNavigate,
  onHome,
  onBack,
  screenTitle,
  onOpenSettings,
  onResetDummyData,
  children,
}) {
  return (
    <div className="min-h-screen w-full bg-[#EAE8E1] text-ink sm:py-6 sm:px-4 flex justify-center items-start selection:bg-emerald-200">
      {/* Mobile Shell Container */}
      <div className="relative flex min-h-screen w-full flex-col bg-[#FAF9F5] shadow-2xl sm:min-h-[860px] sm:max-w-[460px] sm:rounded-[36px] sm:border-[5px] sm:border-stone-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* Top bar */}
        <Topbar
          onToggleSidebar={() => setSidebarOpen(true)}
          onHome={onHome}
          currentScreen={currentScreen}
          onBack={onBack}
          title={screenTitle}
          onOpenSettings={onOpenSettings}
        />

        {/* Sliding Navigation Drawer */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          onResetDummyData={onResetDummyData}
        />

        {/* Screen Content */}
        <main className="flex-1 px-4 py-4 sm:px-5">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

