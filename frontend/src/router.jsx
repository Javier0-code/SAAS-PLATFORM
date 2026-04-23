import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

import LandingPage        from '@pages/LandingPage';
import LoginPage          from '@pages/LoginPage';
import AuthCallbackPage   from '@pages/AuthCallbackPage';
import DashboardPage      from '@pages/DashboardPage';
import ProjectsPage       from '@pages/ProjectsPage';
import WorkspacePage      from '@pages/WorkspacePage';
import JoinWorkspacePage  from '@pages/JoinWorkspacePage';
import NotFoundPage       from '@pages/NotFoundPage';
import AppLayout          from '@components/layout/AppLayout';

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/>
      <p className="text-surface-400 text-sm">Cargando...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen/>;
  if (!isAuthenticated) return <Navigate to="/login" replace/>;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen/>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace/>;
  return children;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"              element={<LandingPage/>}/>
      <Route path="/login"         element={<PublicRoute><LoginPage/></PublicRoute>}/>
      <Route path="/auth/callback" element={<AuthCallbackPage/>}/>
      <Route path="/join/:token"   element={<JoinWorkspacePage/>}/>

      <Route path="/dashboard" element={<ProtectedRoute><AppLayout/></ProtectedRoute>}>
        <Route index              element={<DashboardPage/>}/>
        <Route path="projects"    element={<ProjectsPage/>}/>
        <Route path="team"        element={<WorkspacePage/>}/>
      </Route>

      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
