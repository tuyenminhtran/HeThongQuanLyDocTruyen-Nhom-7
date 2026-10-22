import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useIsAdmin } from "../../store/authStore";

export default function AdminLayout() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      exact: true,
      icon: <i className="fa-solid fa-chart-pie text-base w-5 text-center" />
    },
    {
      name: "Quản lý Truyện",
      path: "/admin/stories",
      exact: false,
      icon: <i className="fa-solid fa-book-open text-base w-5 text-center" />
    },
    {
      name: "Quản lý Thể Loại",
      path: "/admin/categories",
      exact: false,
      icon: <i className="fa-solid fa-tags text-base w-5 text-center" />
    },
    {
      name: "Người Dùng",
      path: "/admin/users",
      exact: false,
      icon: <i className="fa-solid fa-users text-base w-5 text-center" />
    },
    {
      name: "Quản lý Giao Dịch",
      path: "/admin/transactions",
      exact: false,
      icon: <i className="fa-solid fa-receipt text-base w-5 text-center" />
    }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)] bg-ink-bg">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-ink-card border-r border-ink-border shrink-0 p-4 flex flex-col gap-2">
        <h2 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2 px-2">
          Menu Quản Trị
        </h2>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                isActive
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "text-ink-muted hover:text-ink-text hover:bg-ink-bg border border-transparent"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
