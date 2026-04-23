import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { workspaceService } from '@services/workspaceService';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces]           = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [isLoading, setIsLoading]             = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await workspaceService.getAll();
      const list = res.data?.workspaces ?? [];
      setWorkspaces(list);
      // Restaurar el workspace activo desde localStorage
      const savedId = localStorage.getItem('current_workspace_id');
      const found   = list.find(w => w.id === savedId) ?? list[0] ?? null;
      setCurrentWorkspace(found);
    } catch {
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const switchWorkspace = useCallback((workspace) => {
    setCurrentWorkspace(workspace);
    if (workspace) localStorage.setItem('current_workspace_id', workspace.id);
    else           localStorage.removeItem('current_workspace_id');
  }, []);

  const addWorkspace = useCallback((workspace) => {
    setWorkspaces(prev => [...prev, workspace]);
    switchWorkspace(workspace);
  }, [switchWorkspace]);

  const removeWorkspace = useCallback((id) => {
    setWorkspaces(prev => {
      const next = prev.filter(w => w.id !== id);
      if (currentWorkspace?.id === id) switchWorkspace(next[0] ?? null);
      return next;
    });
  }, [currentWorkspace, switchWorkspace]);

  const updateWorkspaceInList = useCallback((updated) => {
    setWorkspaces(prev => prev.map(w => w.id === updated.id ? { ...w, ...updated } : w));
    if (currentWorkspace?.id === updated.id) setCurrentWorkspace(prev => ({ ...prev, ...updated }));
  }, [currentWorkspace]);

  return (
    <WorkspaceContext.Provider value={{
      workspaces, currentWorkspace, isLoading,
      switchWorkspace, addWorkspace, removeWorkspace, updateWorkspaceInList, fetchWorkspaces
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};

export default WorkspaceContext;
