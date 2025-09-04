import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/partials/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/partials/PublicRoute.jsx";

import NotFoundPage from "./pages/NotFoundPage.jsx";
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";
// Public Pages
import { LoginPage } from "./pages/public/LoginPage";
import { HomePage } from "./pages/public/HomePage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { ForgotPasswordPage } from "./pages/public/ForgotPasswordPage";
import { VerifyOTPPage } from "./pages/public/VerifyOTPPage";
import { ResetPasswordPage } from "./pages/public/ResetPasswordPage";
import { RegisterSeniorPage } from "./pages/public/RegisterSeniorPage.jsx";
import { OrganizationPage } from "./pages/public/OrganizationPage.jsx";
import { AboutPage } from "./pages/public/AboutPage.jsx";
import { DeveloperPage } from "./pages/public/DeveloperPage.jsx";

// Admin Pages
import { DashboardPage } from "./pages/admin/DashboardPage";
import { SeniorCitizenPage } from "./pages/admin/SeniorCitizenPage";
import { OfficialsPage } from "./pages/admin/OfficialsPage";
import { PensionListPage } from "./pages/admin/PensionListPage";
import { BenefitsPage } from "./pages/admin/BenefitsPage";
import { SmsPage } from "./pages/admin/SmsPage";
import { ReportPage } from "./pages/admin/ReportPage";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage.jsx";
import { MyProfilePage } from "./pages/admin/MyProfilePage.jsx";
import { AuditLogsPage } from "./pages/admin/AuditLogsPage.jsx";
import { BarangayManagementPage } from "./pages/admin/BarangayManagementPage.jsx";
import { LoginTrailPage } from "./pages/admin/LoginTrailPage.jsx";
import { RecycleBinPage } from "./pages/admin/RecycleBinPage.jsx";
import { EventsPage } from "./pages/admin/EventsPage.jsx";
import { AboutOscaPage } from "./pages/admin/AboutOscaPage.jsx";
import { NotificationPage } from "./pages/admin/NotificationPage.jsx";

// Staff Pages
import { StaffDashboardPage } from "./pages/staff/StaffDashboardPage";
import { StaffSeniorCitizenPage } from "./pages/staff/StaffSeniorCitizenPage.jsx";
import { StaffSmsManagementPage } from "./pages/staff/StaffSmsManagementPage.jsx";
import { StaffBenefitsPage } from "./pages/staff/StaffBenefitsPage.jsx";
import { StaffLoginTrailPage } from "./pages/staff/StaffLoginTrailPage.jsx";
import { StaffAboutPage } from "./pages/staff/StaffAboutPage.jsx";
import { StaffProfilePage } from "./pages/staff/StaffProfilePage.jsx";
import { StaffOfficialPage } from "./pages/staff/StaffOfficialPage.jsx";
import { StaffNewsPage } from "./pages/staff/StaffNewsPage.jsx";

function App() {
  return (
    <Routes>
      {/* Public Routes */}

      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <HomePage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/organization"
        element={
          <PublicOnlyRoute>
            <OrganizationPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/about"
        element={
          <PublicOnlyRoute>
            <AboutPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register-senior"
        element={
          <PublicOnlyRoute>
            <RegisterSeniorPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PublicOnlyRoute>
            <VerifyOTPPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/developer"
        element={
          <PublicOnlyRoute>
            <DeveloperPage />
          </PublicOnlyRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="Admin">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/senior-citizen-list"
        element={
          <ProtectedRoute role="Admin">
            <SeniorCitizenPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/osca-officials"
        element={
          <ProtectedRoute role="Admin">
            <OfficialsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pension-list"
        element={
          <ProtectedRoute role="Admin">
            <PensionListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/benefits"
        element={
          <ProtectedRoute role="Admin">
            <BenefitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sms-management"
        element={
          <ProtectedRoute role="Admin">
            <SmsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="Admin">
            <ReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute role="Admin">
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/my-profile"
        element={
          <ProtectedRoute role="Admin">
            <MyProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user-management"
        element={
          <ProtectedRoute role="Admin">
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute role="Admin">
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/barangays"
        element={
          <ProtectedRoute role="Admin">
            <BarangayManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute role="Admin">
            <NotificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/recycle-bin"
        element={
          <ProtectedRoute role="Admin">
            <RecycleBinPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/login-trail/:userId"
        element={
          <ProtectedRoute role="Admin">
            <LoginTrailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute role="Admin">
            <EventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/about"
        element={
          <ProtectedRoute role="Admin">
            <AboutOscaPage />
          </ProtectedRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute role="Staff">
            <StaffDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/senior-citizen-list"
        element={
          <ProtectedRoute role="Staff">
            <StaffSeniorCitizenPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/sms-management"
        element={
          <ProtectedRoute role="Staff">
            <StaffSmsManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/benefits"
        element={
          <ProtectedRoute role="Staff">
            <StaffBenefitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/official"
        element={
          <ProtectedRoute role="Staff">
            <StaffOfficialPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/login-trails"
        element={
          <ProtectedRoute role="Staff">
            <StaffLoginTrailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/about"
        element={
          <ProtectedRoute role="Staff">
            <StaffAboutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/my-profile"
        element={
          <ProtectedRoute role="Staff">
            <StaffProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/news"
        element={
          <ProtectedRoute role="Staff">
            <StaffNewsPage />
          </ProtectedRoute>
        }
      />

      {/* Not Found */}
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </Routes>
  );
}

export default App;
