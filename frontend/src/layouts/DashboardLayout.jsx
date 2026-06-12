import Sidebar from "../components/Sidebar";
import { Link, useLocation, Outlet } from "react-router-dom";
import { FaHome, FaChartLine, FaClipboardList, FaUser } from "react-icons/fa";

export default function DashboardLayout() {
  const location = useLocation();

  const bottomNavItems = [
    { path: "/dashboard", icon: <FaHome />, label: "Home" },
    { path: "/watchlist", icon: <FaChartLine />, label: "Watchlist" },
    { path: "/orders", icon: <FaClipboardList />, label: "Orders" },
    { path: "/profile", icon: <FaUser />, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans">
      <Sidebar />

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen pb-24 md:pb-0">
        <Outlet />
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B1220] border-t border-white/10 z-50 flex items-center justify-around py-3 md:hidden">
        {bottomNavItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-3 py-1 ${
              location.pathname === item.path
                ? "text-[#32CD32]"
                : "text-[#B8C0D4]"
            }`}
          >
            <div className="w-5 h-5">{item.icon}</div>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}