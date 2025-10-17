import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, DashboardStats, BienAdmin, ClientAdmin, CommandeAdmin, CategorieAdmin, AnnonceAdmin } from '@/services/adminService';
import toast from 'react-hot-toast';

// Hook pour les statistiques du dashboard
export function useDashboardStats() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery<DashboardStats>({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: adminService.getDashboardStats,
    refetchInterval: 30000, // Refetch toutes les 30 secondes
    enabled: isAuthenticated, // Ne charge que si authentifié
    retry: 1, // Réessayer seulement 1 fois en cas d'erreur
  });
}

// Hook pour la gestion des biens
export function useAdminBiens(page = 1, limit = 10, search = '') {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'biens', page, limit, search],
    queryFn: () => adminService.getBiens(page, limit, search),
    enabled: isAuthenticated,
  });
}

export function useAdminBien(id: number) {
  return useQuery({
    queryKey: ['admin', 'biens', id],
    queryFn: () => adminService.getBienById(id),
    enabled: !!id,
  });
}

export function useUpdateBien() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BienAdmin> }) =>
      adminService.updateBien(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'biens'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Bien mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });
}

export function useDeleteBien() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => adminService.deleteBien(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'biens'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Bien supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    },
  });
}

export function useToggleBienStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      adminService.toggleBienStatus(id, enabled),
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'biens'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success(`Bien ${enabled ? 'activé' : 'désactivé'} avec succès`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors du changement de statut');
    },
  });
}

// Hook pour la gestion des clients
export function useAdminClients(page = 1, limit = 10, search = '') {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'clients', page, limit, search],
    queryFn: () => adminService.getClients(page, limit, search),
    enabled: isAuthenticated,
  });
}

export function useAdminClient(id: number) {
  return useQuery({
    queryKey: ['admin', 'clients', id],
    queryFn: () => adminService.getClientById(id),
    enabled: !!id,
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClientAdmin> }) =>
      adminService.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Client mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => adminService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Client supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    },
  });
}

export function useToggleClientStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      adminService.toggleClientStatus(id, enabled),
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success(`Client ${enabled ? 'activé' : 'désactivé'} avec succès`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors du changement de statut');
    },
  });
}

// Hook pour la gestion des commandes
export function useAdminCommandes(page = 1, limit = 10, search = '', status?: number) {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'commandes', page, limit, search, status],
    queryFn: () => adminService.getCommandes(page, limit, search, status),
    enabled: isAuthenticated,
  });
}

export function useAdminCommande(id: number) {
  return useQuery({
    queryKey: ['admin', 'commandes', id],
    queryFn: () => adminService.getCommandeById(id),
    enabled: !!id,
  });
}

export function useUpdateCommandeStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      adminService.updateCommandeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'commandes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Statut de commande mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });
}

// Hook pour la gestion des catégories
export function useAdminCategories() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminService.getCategories,
    enabled: isAuthenticated,
  });
}

export function useCreateCategorie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<CategorieAdmin, 'id' | 'created_at' | 'updated_at'>) =>
      adminService.createCategorie(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success('Catégorie créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });
}

export function useUpdateCategorie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: Partial<CategorieAdmin> }) =>
      adminService.updateCategorie(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success('Catégorie mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });
}

export function useDeleteCategorie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (code: string) => adminService.deleteCategorie(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success('Catégorie supprimée avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

// Hook pour la gestion des annonces
export function useAdminAnnonces(page = 1, limit = 10, search = '', status?: string) {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'annonces', page, limit, search, status],
    queryFn: () => adminService.getAnnonces(page, limit, search, status),
    enabled: isAuthenticated,
  });
}

export function useAdminAnnonce(code: string) {
  return useQuery({
    queryKey: ['admin', 'annonces', code],
    queryFn: () => adminService.getAnnonceByCode(code),
    enabled: !!code,
  });
}

export function useUpdateAnnonceStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ code, enabled }: { code: string; enabled: number }) =>
      adminService.updateAnnonceStatus(code, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'annonces'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Statut de l\'annonce mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du statut');
    },
  });
}

export function useUpdateAnnonce() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: any }) => adminService.updateAnnonce(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'annonces'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Annonce mise à jour avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

export function useDeleteAnnonce() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (code: string) => adminService.deleteAnnonce(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'annonces'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Annonce supprimée avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

export function useAnnoncesStats() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'annonces', 'stats'],
    queryFn: adminService.getAnnoncesStats,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch toutes les 30 secondes
  });
}
