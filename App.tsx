
import React, { useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Common/Sidebar';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { Button, Spinner } from './components/Common/ui'; // Adjusted path for ui
import { Menu } from 'lucide-react';
import ErrorBoundary from './components/Common/ErrorBoundary'; // Import Error Boundary from new location
import { ToastProvider } from './hooks/useToast'; // Import ToastProvider

// Lazy load page components
const StudyHub = lazy(() => import('./pages/Dashboard'));
const AiTutor = lazy(() => import('./pages/AiChat'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const StudyRoom = lazy(() => import('./pages/StudyRoom'));
const StudyLobby = lazy(() => import('./pages/StudyLobby'));
const Insights = lazy(() => import('./pages/Insights'));
const Notes = lazy(() => import('./pages/Notes'));
const CourseCommunity = lazy(() => import('./pages/CourseCommunity'));
const QuizPractice = lazy(() => import('./pages/QuizPractice'));
const InterviewQuiz = lazy(() => import('./pages/InterviewQuiz'));
const SudokuGame = lazy(() => import('./pages/SudokuGame'));
const ZipGame = lazy(() => import('./pages/ZipGame'));
const SpeedMathGame = lazy(() => import('./pages/SpeedMathGame'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Terms = lazy(() => import('./pages/Terms'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));


const AuthLayout: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <Outlet />
  </div>
);

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header for mobile */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-700">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="p-2"
            >
                <Menu size={24} />
            </Button>
            {/* You can add a logo or page title here for mobile view */}
            <span className="font-bold text-lg">NexusAI</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
};

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
                  <Route path="insights" element={<Insights />} />
                  <Route path="notes" element={<Notes />} />
                  <Route path="community/:courseId" element={<CourseCommunity />} />
                  <Route path="quizzes" element={<QuizPractice />} />
                  <Route path="interview" element={<InterviewQuiz />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                  <Route path="sudoku" element={<SudokuGame />} />
                  <Route path="zip" element={<ZipGame />} />
                  <Route path="speed-math" element={<SpeedMathGame />} />

                </Route>
              ) : (
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/terms" element={<Terms />} />
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