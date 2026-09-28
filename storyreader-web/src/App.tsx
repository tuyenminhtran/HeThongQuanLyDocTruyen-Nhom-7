import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import StoryDetailPage from "./pages/StoryDetailPage";
import ChapterReadPage from "./pages/ChapterReadPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminStoriesPage from "./pages/AdminStoriesPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

import ProfilePage from "./pages/ProfilePage";
import PricingPage from "./pages/PricingPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/stories/:id" element={<StoryDetailPage />} />
          <Route path="/chapters/:id" element={<ChapterReadPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/stories" element={<AdminStoriesPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
