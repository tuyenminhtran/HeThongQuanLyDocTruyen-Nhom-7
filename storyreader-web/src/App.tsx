import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";
import AtmosphericOverlay, { type AtmosphereType } from "./components/AtmosphericOverlay";
import InteractiveMascot from "./components/InteractiveMascot";

const StoryDetailPage = lazy(() => import("./pages/StoryDetailPage"));
const ChapterReadPage = lazy(() => import("./pages/ChapterReadPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const RankingsPage = lazy(() => import("./pages/RankingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const FollowingPage = lazy(() => import("./pages/FollowingPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const AdminStoriesPage = lazy(() => import("./pages/AdminStoriesPage"));
const AdminSchedulesPage = lazy(() => import("./pages/admin/AdminSchedulesPage"));
const AdminReportedCommentsPage = lazy(() => import("./pages/admin/AdminReportedCommentsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/AdminCategoriesPage"));
const AdminTransactionsPage = lazy(() => import("./pages/admin/AdminTransactionsPage"));

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
        <i className="fa-solid fa-spinner fa-spin text-orange-500 text-lg" />
        <span>Đang tải trang...</span>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [atmosphere, setAtmosphere] = useState<AtmosphereType>(() => {
    return (localStorage.getItem("storyreader-atmosphere") as AtmosphereType) || "none";
  });

  const handleAtmosphereChange = (type: AtmosphereType) => {
    setAtmosphere(type);
    localStorage.setItem("storyreader-atmosphere", type);
    window.dispatchEvent(new CustomEvent("storyreader-atmosphere-changed", { detail: type }));
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<AtmosphereType>;
      if (custom.detail) {
        setAtmosphere(custom.detail);
        localStorage.setItem("storyreader-atmosphere", custom.detail);
      }
    };
    window.addEventListener("storyreader-atmosphere-changed", handler);
    return () => window.removeEventListener("storyreader-atmosphere-changed", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Easter Egg #1: Hiệu ứng bối cảnh canvas toàn màn hình (chỉ hiển thị ở giao diện người đọc) */}
      {!isAdminRoute && <AtmosphericOverlay type={atmosphere} />}

      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Public / User Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/bang-xep-hang" element={<RankingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/following" element={<FollowingPage />} />
            <Route path="/bookmarks" element={<FollowingPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/stories/:id" element={<StoryDetailPage />} />
            <Route path="/chapters/:id" element={<ChapterReadPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="stories" element={<AdminStoriesPage />} />
              <Route path="schedules" element={<AdminSchedulesPage />} />
              <Route path="reports" element={<AdminReportedCommentsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="transactions" element={<AdminTransactionsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      <Footer />

      {/* Easter Egg #3: Linh vật tương tác Mèo Jiji & Biến hình Totoro (chỉ hiển thị ở giao diện người đọc, ẩn trong Admin) */}
      {!isAdminRoute && (
        <InteractiveMascot
          currentAtmosphere={atmosphere}
          onAtmosphereChange={handleAtmosphereChange}
        />
      )}
    </div>
  );
}
