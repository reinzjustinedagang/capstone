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
import { GuidePage } from "./pages/public/GuidePage.jsx";
import { OrganizationPage } from "./pages/public/OrganizationPage.jsx";
import { AboutPage } from "./pages/public/AboutPage.jsx";
import { DeveloperPage } from "./pages/public/DeveloperPage.jsx";
import { RepublicActsPage } from "./pages/public/RepublicActsPage.jsx";
import { HomeEventPage } from "./pages/public/HomeEventsPage.jsx";

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
import { ArchivePage } from "./pages/admin/ArchivePage.jsx";

// Staff Pages
import { StaffDashboardPage } from "./pages/staff/StaffDashboardPage";
import { StaffSeniorCitizenPage } from "./pages/staff/StaffSeniorCitizenPage.jsx";
import { StaffSmsManagementPage } from "./pages/staff/StaffSmsManagementPage.jsx";
import { StaffBenefitsPage } from "./pages/staff/StaffBenefitsPage.jsx";
import { StaffLoginTrailPage } from "./pages/staff/StaffLoginTrailPage.jsx";
import { StaffAboutPage } from "./pages/staff/StaffAboutPage.jsx";
import { StaffProfilePage } from "./pages/staff/StaffProfilePage.jsx";
import { StaffOfficialPage } from "./pages/staff/StaffOfficialPage.jsx";
import { StaffEventsPage } from "./pages/staff/StaffEventsPage.jsx";
import { HomeBenefitsPage } from "./pages/public/HomeBenefitsPage.jsx";
import { StaffReportsPage } from "./pages/staff/StaffReportsPage.jsx";
import StaffLayout from "./components/staff/layout/StaffLayout.jsx";
import Layout from "./components/layouts/Layout.jsx";
import LandingLayout from "./components/startPage/layout/LandingLayout.jsx";
import { EventDetailsPage } from "./pages/public/EventDetailsPage.jsx";
import { BenefitDetailsPage } from "./pages/public/BenefitDetailsPage.jsx";
import { RepublicActDetailsPage } from "./pages/public/RepublicActDetailsPage.jsx";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<LandingLayout />}>
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <HomePage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/republic-acts"
          element={
            <PublicOnlyRoute>
              <RepublicActsPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/events"
          element={
            <PublicOnlyRoute>
              <HomeEventPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/benefits"
          element={
            <PublicOnlyRoute>
              <HomeBenefitsPage />
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
          path="/developer"
          element={
            <PublicOnlyRoute>
              <DeveloperPage />
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
          path="/register-guide"
          element={
            <PublicOnlyRoute>
              <GuidePage />
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
          path="/events/:id"
          element={
            <PublicOnlyRoute>
              <EventDetailsPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/benefits/:id"
          element={
            <PublicOnlyRoute>
              <BenefitDetailsPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/ra/:id"
          element={
            <PublicOnlyRoute>
              <RepublicActDetailsPage />
            </PublicOnlyRoute>
          }
        />
      </Route>

      {/* Auth-related routes (no Header/Footer needed) */}

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="Admin">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="senior-citizen-list" element={<SeniorCitizenPage />} />
        <Route path="osca-officials" element={<OfficialsPage />} />
        <Route path="pension-list" element={<PensionListPage />} />
        <Route path="benefits" element={<BenefitsPage />} />
        <Route path="sms-management" element={<SmsPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="my-profile" element={<MyProfilePage />} />
        <Route path="user-management" element={<UserManagementPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="barangays" element={<BarangayManagementPage />} />
        <Route path="notifications" element={<NotificationPage />} />
        <Route path="recycle-bin" element={<RecycleBinPage />} />
        <Route path="login-trail/:userId" element={<LoginTrailPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="about-osca" element={<AboutOscaPage />} />
        <Route path="archive" element={<ArchivePage />} />
      </Route>

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute role="Staff">
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StaffDashboardPage />} />
        <Route
          path="senior-citizen-list"
          element={<StaffSeniorCitizenPage />}
        />
        <Route path="sms-management" element={<StaffSmsManagementPage />} />
        <Route path="benefits" element={<StaffBenefitsPage />} />
        <Route path="official" element={<StaffOfficialPage />} />
        <Route path="login-trails" element={<StaffLoginTrailPage />} />
        <Route path="about" element={<StaffAboutPage />} />
        <Route path="my-profile" element={<StaffProfilePage />} />
        <Route path="events" element={<StaffEventsPage />} />
        <Route path="reports" element={<StaffReportsPage />} />
      </Route>

      {/* Not Found */}
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </Routes>
  );
}

export default App;
