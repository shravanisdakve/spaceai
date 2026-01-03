import React, { useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { Spinner } from './components/Common/ui';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { ToastProvider } from './hooks/useToast';
import MainLayout from './components/Layout/MainLayout'; // Import new layout

// Lazy load page components
const StudyHub = lazy(() => import('./pages/Dashboard'));
const AiTutor = lazy(() => import('./pages/AiChat'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const StudyRoom = lazy(() => import('./pages/StudyRoom'));
const StudyLobby = lazy(() => import('./pages/StudyLobby'));
const SocialHub = lazy(() => import('./pages/SocialHub')); // New Lazy Import
const GroupDetails = lazy(() => import('./pages/GroupDetails'));
const Insights = lazy(() => import('./pages/Insights'));
const Notes = lazy(() => import('./pages/Notes'));
const CourseCommunity = lazy(() => import('./pages/CourseCommunity'));
const QuizPractice = lazy(() => import('./pages/QuizPractice'));
const InterviewQuiz = lazy(() => import('./pages/InterviewQuiz'));
const SudokuGame = lazy(() => import('./pages/SudokuGame'));
const ZipGame = lazy(() => import('./pages/ZipGame'));
const SpeedMathGame = lazy(() => import('./pages/SpeedMathGame'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Profile = lazy(() => import('./pages/Profile'));

const AuthLayout: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <Outlet />
  </div>
);

const App: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <Spinner />
      </div>
    )
  }

  return (
    <ToastProvider>
      <HashRouter>
        <ErrorBoundary>
          <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-slate-900"><Spinner /></div>}>
            <Routes>
              {currentUser ? (
                <Route
                  path="/*"
                  element={
                    <MainLayout />
                  }
                >
                  <Route index element={<StudyHub />} />
                  <Route path="tutor" element={<AiTutor />} />
                  <Route path="study-lobby" element={<StudyLobby />} />
                  <Route path="study-room/:id" element={<StudyRoom />} />
                  <Route path="social" element={<SocialHub />} />
                  <Route path="group/:id" element={<GroupDetails />} /> {/* New Route */}
                  <Route path="insights" element={<Insights />} />
                  <Route path="notes" element={<Notes />} />
                  <Route path="community/:courseId" element={<CourseCommunity />} />
                  <Route path="quizzes" element={<QuizPractice />} />
                  <Route path="interview" element={<InterviewQuiz />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                  <Route path="sudoku" element={<SudokuGame />} />
                  <Route path="zip" element={<ZipGame />} />
                  <Route path="speed-math" element={<SpeedMathGame />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="terms" element={<TermsOfService />} />
                  <Route path="privacy" element={<PrivacyPolicy />} />

                </Route>
              ) : (
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Route>
              )}
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;