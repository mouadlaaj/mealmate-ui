import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Utensils,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const firstName = userData.firstName || "";
  const lastName = userData.lastName || "";
  const role = userData.role || "";

  const fullName = `${firstName} ${lastName}`.trim() || "User";

  const initials =
    (firstName.charAt(0) || "").toUpperCase() +
    (lastName.charAt(0) || "").toUpperCase();

  const formattedRole = role
    .replace("ROLE_", "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={21} />,
    },
    {
      name: "My Recipes",
      path: "/recipes",
      icon: <BookOpen size={21} />,
    },
    {
      name: "Meal Plan",
      path: "/mealPlans",
      icon: <CalendarDays size={21} />,
    },
  
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
    setProfileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    navigate("/login", {
      replace: true,
    });
  };

  const sidebarContent = (expanded) => {
    return (
      <div className="flex h-full flex-col bg-white">
        <div
          onClick={() => handleNavigate("/dashboard")}
          className="flex h-[88px] cursor-pointer items-center px-[18px]"
        >
          <div className="flex h-12 w-12 min-w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B5FFF] to-[#0642C4] text-white shadow-lg shadow-blue-500/20">
            <Utensils size={23} />
          </div>

          {expanded && (
            <h1 className="ml-3 whitespace-nowrap text-xl font-extrabold text-[#0B1B3F]">
              Meal<span className="text-[#0B5FFF]">Mate</span>
            </h1>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`relative flex min-h-[54px] w-full items-center rounded-xl transition ${
                  expanded ? "justify-start px-4" : "justify-center"
                } ${
                  isActive
                    ? "border border-[#D8E6FF] bg-[#EEF4FF] text-[#0B5FFF]"
                    : "border border-transparent text-[#5B6B8C] hover:bg-[#F6F9FF]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 h-7 w-1 rounded-r-full bg-[#0B5FFF]" />
                )}

                <span className="flex min-w-[24px] items-center justify-center">
                  {item.icon}
                </span>

                {expanded && (
                  <span className="ml-3 whitespace-nowrap text-sm font-semibold">
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mx-5 border-t border-[#EEF2FA]" />

        <div className="relative p-3">
          {profileMenuOpen && (
            <div className="absolute bottom-[85px] left-3 z-50 w-[210px] overflow-hidden rounded-2xl border border-[#EEF2FA] bg-white shadow-xl">
              <button
                onClick={() => handleNavigate("/profile")}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#0B1B3F] hover:bg-[#F6F9FF]"
              >
                <User size={18} className="text-[#0B5FFF]" />
                View Profile
              </button>

              <div className="border-t border-[#EEF2FA]" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}

          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={`flex w-full items-center rounded-xl p-2 transition hover:bg-[#F6F9FF] ${
              expanded ? "gap-3" : "justify-center"
            }`}
          >
            <div className="flex h-11 w-11 min-w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0B5FFF] to-[#0642C4] p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-bold text-[#0B5FFF]">
                {initials || "U"}
              </div>
            </div>

            {expanded && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-bold text-[#0B1B3F]">
                    {fullName}
                  </p>

                  <p className="truncate text-xs text-[#7C8AA6]">
                    {formattedRole}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-[#7C8AA6] transition ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0B5FFF] shadow-lg md:hidden"
      >
        <Menu size={24} />
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[270px] bg-white shadow-2xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#7C8AA6] hover:bg-[#F6F9FF]"
        >
          <X size={20} />
        </button>

        {sidebarContent(true)}
      </aside>

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setProfileMenuOpen(false);
        }}
        className={`sticky top-0 z-30 hidden h-screen flex-shrink-0 overflow-hidden border-r border-[#EEF2FA] bg-white transition-all duration-300 md:block ${
          isHovered ? "w-[272px] shadow-xl" : "w-[84px]"
        }`}
      >
        {sidebarContent(isHovered)}
      </aside>
    </>
  );
};

export default Sidebar;