import React from "react";
import { Home, Users, Briefcase, UserCheck, LayoutGrid, SquareUser as UserSquare2, Package, Handshake, Settings, X, FileText, Target } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../../features/auth/useAuth";
import type { TabKey } from "../shared/types";

const NAV: { key: TabKey; label: string; icon: React.ComponentType<any> }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "clients", label: "Clients", icon: Users },
  { key: "projects", label: "Projects", icon: Briefcase },
  { key: "access_requests", label: "Access Requests", icon: UserCheck },
  { key: "partners", label: "Partners", icon: Handshake },
  { key: "applications", label: "Applications", icon: FileText },
  // NOTE: Teams, Equipment, Services, and Jobs have been removed from the main navigation.
  { key: "settings", label: "Settings", icon: Settings },
];

type Props = {
  active: TabKey;
  onSelect: (k: TabKey) => void;
  isMobile?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
};

const SideBar: React.FC<Props> = ({
  active,
  onSelect,
  isMobile = false,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  if (!isMobile) {
    return (
      <aside className="h-full w-72 border-r bg-white">
        <Header />
        <NavList active={active} onSelect={onSelect} />
        <BottomArea />
      </aside>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity sm:hidden ${isOpenMobile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onCloseMobile}
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 border-r bg-white shadow-xl transition-transform sm:hidden ${isOpenMobile ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between h-14">
          <Link to="/" aria-label="Back to public website home">
            <img src="https://i.imgur.com/eioVNZq.png" alt="Logo" className="h-8" />
          </Link>
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Close menu"
            onClick={onCloseMobile}
          >
            <X size={18} />
          </button>
        </div>
        <NavList active={active} onSelect={(k) => { onSelect(k); onCloseMobile?.(); }} />
        <BottomArea />
      </aside>
    </>
  );
};

const Header: React.FC = () => (
  <div className="h-14 px-5 py-4 border-b flex items-center">
    <Link to="/" aria-label="Back to public website home">
      <img src="https://i.imgur.com/eioVNZq.png" alt="Logo" className="h-8" />
    </Link>
  </div>
);

const NavList: React.FC<{ active: TabKey; onSelect: (k: TabKey) => void }> = ({ active, onSelect }) => {
  const isActive = (key: TabKey) => key === active;

  return (
    <nav className="p-2 sm:p-3">
      <ul className="space-y-1">
        {NAV.map(({ key, label, icon: Icon }) => (
          <li key={key}>
            <button
              onClick={() => onSelect(key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${isActive(key) ? "bg-gray-900 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const BottomArea: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/");
    }
  };

  return (
    <div className="mt-auto border-t pt-3 px-3 pb-3">
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        Logout
      </button>
    </div>
  );
};

export default SideBar;
