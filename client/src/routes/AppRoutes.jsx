import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Auth/ResetPasswordPage";
import MainLayout from "../layout/MainLayout";
import { useAuth } from "../context/AuthContext";

import MedicalRecordPage from "../pages/MedicalRecordPage";

function PublicOnlyRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/home" replace />;
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route index element={
                <PublicOnlyRoute>
                    <LoginPage />
                </PublicOnlyRoute>
            } />
            <Route path="/login" element={
                <PublicOnlyRoute>
                    <LoginPage />
                </PublicOnlyRoute>
            } />
            <Route path="/register" element={
                <PublicOnlyRoute>
                    <RegisterPage />
                </PublicOnlyRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route element={<MainLayout />}>
                <Route path="/home" element={<MedicalRecordPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
