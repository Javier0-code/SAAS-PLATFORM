import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@services/projectService';
import { useWorkspace } from '@context/WorkspaceContext';
import toast from 'react-hot-toast';

export const useProjects = (filters = {}) => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  return useQuery({
    queryKey: ['projects', workspaceId, filters],
    queryFn:  () => projectService.getAll({ workspaceId, ...filters })
      .then(r => r.data?.projects ?? []),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2
  });
};

export const useAllProjects = (filters = {}) => {
  return useQuery({
    queryKey: ['projects', 'all', filters],
    queryFn:  () => projectService.getAllMine(filters).then(r => r.data?.projects ?? []),
    staleTime: 1000 * 60 * 2
  });
};

export const useProjectTags = () => {
  const { currentWorkspace } = useWorkspace();
  return useQuery({
    queryKey: ['projects', 'tags', currentWorkspace?.id],
    queryFn:  () => projectService.getTags(currentWorkspace?.id).then(r => r.data?.tags ?? []),
    enabled:  !!currentWorkspace?.id
  });
};

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectService.create,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Proyecto "${res.data.name}" creado`);
    },
    onError: (err) => toast.error(err.message || 'Error al crear el proyecto')
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => projectService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto actualizado');
    },
    onError: (err) => toast.error(err.message || 'Error al actualizar')
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto eliminado');
    },
    onError: (err) => toast.error(err.message || 'Error al eliminar')
  });
};

export const useToggleFavorite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectService.toggleFav,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
    onError: (err) => toast.error(err.message || 'Error')
  });
};
