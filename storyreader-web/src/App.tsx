import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";
import StoryDetailPage from "./pages/StoryDetailPage";
import ChapterReadPage from "./pages/ChapterReadPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RankingsPage from "./pages/RankingsPage";
import ProfilePage from "./pages/ProfilePage";
import FollowingPage from "./pages/FollowingPage";
import HistoryPage from "./pages/HistoryPage";
import PricingPage from "./pages/PricingPage";

import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminStoriesPage from "./pages/AdminStoriesPage";
import AdminSchedulesPage from "./pages/admin/AdminSchedulesPage";
import AdminReportedCommentsPage from "./pages/admin/AdminReportedCommentsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminTransactionsPage from "./pages/admin/AdminTransactionsPage";

import AtmosphericOverlay, { type AtmosphereType } from "./components/AtmosphericOverlay";
import InteractiveMascot from "./components/InteractiveMascot";

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
