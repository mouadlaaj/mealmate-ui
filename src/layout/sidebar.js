import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v7H4V4zm9 0h7v4h-7V4zm0 7h7v9h-7v-9zm-9 3h7v6H4v-6z" />
      </svg>
    ),
  },



];

const getUserData = () => {
  const saved = localStorage.getItem("userData");
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
};

const formatRole = (role) => {
  if (!role) return "";
  return role
    .replace("ROLE_", "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};



const SidebarContent = ({ expanded, onNavigate, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = getUserData();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const firstName = userData.firstName || "";
  const lastName = userData.lastName || "";
  const role = userData.role || "";
  const initials = (firstName.charAt(0) || "").toUpperCase() + (lastName.charAt(0) || "").toUpperCase();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const goTo = (path) => {
    navigate(path);
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("userData");
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-full flex flex-col">
      <div onClick={() => goTo("/dashboard")} className="flex items-center gap-3 cursor-pointer py-6 px-[18px]">
        <p
          className={`text-[1.3rem] font-extrabold text-[#0B1B3F] whitespace-nowrap overflow-hidden transition-all duration-200 ${
            expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
          }`}
        >
          Meal<span className="text-[#0B5FFF]">Mate</span>
        </p>
      </div>

      <p
        className={`px-6 pb-2 text-[0.7rem] font-bold tracking-[0.08em] text-[#A6B3CC] overflow-hidden transition-opacity duration-200 ${
          expanded ? "opacity-100 h-auto" : "opacity-0 h-0"
        }`}
      >
        MENU
      </p>

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => goTo(item.path)}
              className={`relative w-full flex items-center rounded-[14px] min-h-[54px] px-3 transition-all duration-200 ${
                expanded ? "justify-start hover:translate-x-1" : "justify-center"
              } ${
                isActive
                  ? "text-[#0B5FFF] bg-[#EEF4FF] border border-[#D8E6FF] shadow-[0_4px_14px_rgba(11,95,255,0.12)]"
                  : "text-[#5B6B8C] border border-transparent hover:bg-[#F6F9FF]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-[22%] h-[56%] w-1 rounded bg-[#0B5FFF]" />
              )}
              <span className="flex items-center justify-center w-6 h-6 shrink-0">{item.icon}</span>
              <span
                className={`ml-3 text-[0.94rem] font-semibold whitespace-nowrap overflow-hidden transition-all duration-200 ${
                  expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

      </nav>

      <hr className="mx-5 my-4 border-[#EEF2FA]" />

      <div className="relative mx-3 mb-4" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-[14px] hover:bg-[#F6F9FF] transition-colors"
        >
          <div
            className="w-[46px] h-[46px] min-w-[46px] rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#0B5FFF,#0642C4)", boxShadow: "0 6px 16px rgba(11,95,255,.28)" }}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[0.9rem] font-bold text-[#0B5FFF]">
              {initials || "U"}
            </div>
          </div>

          <div
            className={`flex-1 min-w-0 text-left overflow-hidden transition-all duration-200 ${
              expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            <p className="truncate font-bold text-[#0B1B3F] text-[0.92rem]">
              {firstName} {lastName}
            </p>
            <p className="truncate text-[0.78rem] text-[#7C8AA6]">{formatRole(role)}</p>
          </div>

          <svg
            className={`w-4 h-4 shrink-0 text-[#7C8AA6] overflow-hidden transition-all duration-200 ${
              expanded ? "opacity-100 w-4" : "opacity-0 w-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <div
            className="absolute bottom-[110%] left-0 w-[210px] bg-white rounded-2xl overflow-hidden z-20"
            style={{ boxShadow: "0 12px 32px rgba(15,23,42,0.16)" }}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                goTo("/profile");
              }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[0.9rem] text-[#0B1B3F] hover:bg-[#F6F9FF]"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="#0B5FFF" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0" />
                <circle cx="12" cy="7.5" r="4" />
              </svg>
              View Profile
            </button>
            <hr className="border-[#EEF2FA]" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[0.9rem] text-[#D32F2F] hover:bg-[#FFF3F3]"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="#D32F2F" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7M7 4H5a2 2 0 00-2 2v12a2 2 0 002 2h2" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden fixed top-3.5 left-3.5 z-[1300] w-11 h-11 rounded-xl bg-white flex items-center justify-center"
          style={{ boxShadow: "0 4px 16px rgba(11,95,255,0.22)" }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#0B5FFF" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 bg-slate-900/30 z-[1250]" onClick={() => setMobileOpen(false)} />
        )}

        <aside
          className={`fixed top-0 left-0 h-screen w-[268px] bg-white z-[1300] transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ boxShadow: "8px 0 30px rgba(15,23,42,0.16)" }}
        >
          <div className="flex justify-end p-1">
            <button onClick={() => setMobileOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F6F9FF]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#7C8AA6" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SidebarContent expanded={true} isMobile={true} onNavigate={() => setMobileOpen(false)} />
        </aside>
      </>
    );
  }

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="sticky top-0 h-screen bg-white border-r border-[#EEF2FA] overflow-hidden transition-[width] duration-300 ease-out flex-shrink-0 z-[1200]"
      style={{
        width: isHovered ? 272 : 84,
        boxShadow: isHovered ? "10px 0 30px rgba(15,23,42,0.08)" : "2px 0 10px rgba(15,23,42,0.04)",
      }}
    >
      <SidebarContent expanded={isHovered} isMobile={false} />
    </aside>
  );
};

export default Sidebar;
