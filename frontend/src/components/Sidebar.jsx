import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaChartLine,
  FaClipboardList,
  FaBriefcase,
  FaChartPie,
  FaBook,
  FaUser,
  FaSignOutAlt,
} from 'react-icons/fa';
import { motion } from "framer-motion";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard",  icon: <FaHome />,       label: "Dashboard" },
    { path: "/watchlist",  icon: <FaChartLine />,   label: "Watchlist" },
    { path: "/orders",     icon: <FaClipboardList />,label: "Orders" },
    { path: "/positions",  icon: <FaBriefcase />,   label: "Positions" },
    { path: "/portfolio",  icon: <FaChartPie />,    label: "Portfolio" },
    { path: "/education",  icon: <FaBook />,        label: "Learning Hub" },
    { path: "/profile",    icon: <FaUser />,        label: "Profile" },
  ];

  return (
    <div className="w-64 h-screen bg-[#0B1220] border-r border-white/10 fixed left-0 top-0 p-6 flex flex-col hidden md:flex z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#32CD32] to-[#39FF14] flex items-center justify-center">
          <img
            src="/BullBoom.jpeg"
            alt="BullBoom"
            className="w-10 h-10 rounded-lg object-cover"
          />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-[#32CD32] to-[#39FF14] bg-clip-text text-transparent">
          Bull Boom
        </span>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-2 flex-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path
                ? "bg-gradient-to-r from-[#32CD32]/20 to-[#39FF14]/20 border border-[#32CD32]/30 shadow-[0_0_20px_rgba(50,205,50,0.2)]"
                : "hover:bg-white/5 hover:border-white/10 border border-transparent"
            }`}
          >
            <div
              className={`w-5 h-5 ${
                location.pathname === item.path
                  ? "text-[#32CD32]"
                  : "text-[#B8C0D4]"
              }`}
            >
              {item.icon}
            </div>
            <span
              className={`${
                location.pathname === item.path
                  ? "text-white font-semibold"
                  : "text-[#B8C0D4]"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <Link
        to="/"
        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-red-400/30 hover:bg-red-400/5 transition-all"
      >
        <FaSignOutAlt className="w-5 h-5 text-[#B8C0D4]" />
        <span className="text-[#B8C0D4]">Logout</span>
      </Link>
    </div>
  );
}
