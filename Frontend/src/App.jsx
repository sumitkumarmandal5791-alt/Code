import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import CommandPalette from "./components/CommandPalette";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthModal from "./components/auth/AuthModal";

// Pages
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import ProblemEdititor from "./pages/ProblemEdititor";
import Adminpage from "./pages/adminHomepage";
import CreateProblem from "./AdminWork/createProblem";
import UpdateProblem from "./AdminWork/updateProblem";
import DeleteProblem from "./AdminWork/deleteProblem";
import UpdateProblemById from "./AdminWork/updateProblembyId.jsx";
import AdminCreateVideo from "./AdminWork/videocreate.jsx";
import UploadVideo from "./AdminWork/uploadVideo.jsx";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage.jsx";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <AuthModal />
          <CommandPalette />

          <Routes>
            {/* Public landing page with role-based auth modal */}
            <Route path="/" element={<LandingPage />} />

            {/* Redirect standalone login/signup routes back to landing page */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />

            {/* User Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/problem-editor/:id"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <ProblemEdititor />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Adminpage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CreateProblem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/update"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UpdateProblem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/delete"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DeleteProblem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/updateproblembyid/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UpdateProblemById />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/createvideo"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminCreateVideo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/uploadvideo/:problemId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UploadVideo />
                </ProtectedRoute>
              }
            />

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
