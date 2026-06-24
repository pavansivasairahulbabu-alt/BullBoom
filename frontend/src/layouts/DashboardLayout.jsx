import Sidebar from "../components/Sidebar";
import { Link, useLocation, Outlet } from "react-router-dom";
import { FaHome, FaChartLine, FaClipboardList, FaUser, FaChartPie, FaStopwatch } from "react-icons/fa";

export default function DashboardLayout() {
  const location = useLocation();

  const bottomNavItems = [
    { path: "/dashboard", icon: <FaHome />,        label: "Home" },
    { path: "/watchlist", icon: <FaChartLine />,    label: "Watchlist" },
    { path: "/portfolio", icon: <FaChartPie />,     label: "Portfolio" },
    { path: "/orders",    icon: <FaClipboardList />, label: "Orders" },
    { path: "/trigger-orders", icon: <FaStopwatch />, label: "Triggers" },
    { path: "/profile",   icon: <FaUser />,          label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans overflow-x-hidden">
      <Sidebar />

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen pb-24 md:pb-0 overflow-x-hidden">
        <Outlet />
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0B1220]/95 px-2 py-2 backdrop-blur-xl md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-md grid-cols-6 items-center gap-1">
        {bottomNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-2 py-2 text-center transition-colors ${
              location.pathname === item.path
                ? "text-[#32CD32]"
                : "text-[#B8C0D4]"
            }`}
          >
            <div className="h-5 w-5">{item.icon}</div>
            <span className="w-full truncate text-[10px] leading-none">{item.label}</span>
          </Link>
        ))}
        </div>
      </div>
    </div>
  );
}