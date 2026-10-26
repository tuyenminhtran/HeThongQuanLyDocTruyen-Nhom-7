import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import StoryDetailPage from "./pages/StoryDetailPage";
import ChapterReadPage from "./pages/ChapterReadPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

import ProfilePage from "./pages/ProfilePage";
import FollowingPage from "./pages/FollowingPage";
import HistoryPage from "./pages/HistoryPage";
import PricingPage from "./pages/PricingPage";

import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminStoriesPage from "./pages/AdminStoriesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminTransactionsPage from "./pages/admin/AdminTransactionsPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public / User Routes */}
          <Route path="/" element={<HomePage />} />
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
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="transactions" element={<AdminTransactionsPage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
