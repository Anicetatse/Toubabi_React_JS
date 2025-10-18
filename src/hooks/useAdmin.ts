import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, DashboardStats, BienAdmin, ClientAdmin, CommandeAdmin, CategorieAdmin, AnnonceAdmin, CommentaireAdmin, TypeAnnonceAdmin, CaracteristiqueAdmin, VilleAdmin, CommuneAdmin, QuartierAdmin, AdminUser, Role, Permission } from '@/services/adminService';
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

// Hook pour la gestion des commentaires
export function useAdminCommentaires(page = 1, limit = 10, search = '', status?: string) {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'commentaires', page, limit, search, status],
    queryFn: () => adminService.getCommentaires(page, limit, search, status),
    enabled: isAuthenticated,
  });
}

export function useUpdateCommentaireStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: number }) =>
      adminService.updateCommentaireStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'commentaires'] });
      toast.success('Statut du commentaire mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du statut');
    },
  });
}

export function useDeleteCommentaire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteCommentaire(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'commentaires'] });
      toast.success('Commentaire supprimé avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

export function useCommentairesStats() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'commentaires', 'stats'],
    queryFn: adminService.getCommentairesStats,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch toutes les 30 secondes
  });
}

// Hook pour la gestion des types d'annonces
export function useTypeAnnonces() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'type-annonces'],
    queryFn: adminService.getTypeAnnonces,
    enabled: isAuthenticated,
  });
}

export function useCreateTypeAnnonce() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { nom: string }) => 
      adminService.createTypeAnnonce(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'type-annonces'] });
      toast.success('Type d\'annonce créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });
}

export function useUpdateTypeAnnonce() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nom: string } }) =>
      adminService.updateTypeAnnonce(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'type-annonces'] });
      toast.success('Type d\'annonce mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });
}

export function useDeleteTypeAnnonce() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteTypeAnnonce(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'type-annonces'] });
      toast.success('Type d\'annonce supprimé avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

// Hook pour la gestion des caractéristiques
export function useCaracteristiques() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'caracteristiques'],
    queryFn: adminService.getCaracteristiques,
    enabled: isAuthenticated,
  });
}

export function useCreateCaracteristique() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { nom: string }) => 
      adminService.createCaracteristique(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'caracteristiques'] });
      toast.success('Caractéristique créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });
}

export function useUpdateCaracteristique() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nom: string } }) =>
      adminService.updateCaracteristique(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'caracteristiques'] });
      toast.success('Caractéristique mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });
}

export function useUpdateCaracteristiqueStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: number }) =>
      adminService.updateCaracteristiqueStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'caracteristiques'] });
      toast.success('Statut de la caractéristique mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du statut');
    },
  });
}

export function useDeleteCaracteristique() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteCaracteristique(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'caracteristiques'] });
      toast.success('Caractéristique supprimée avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

// Hook pour la gestion des villes
export function useVilles() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'villes'],
    queryFn: adminService.getVilles,
    enabled: isAuthenticated,
  });
}

export function useCreateVille() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { nom: string }) => 
      adminService.createVille(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'villes'] });
      toast.success('Ville créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });
}

export function useUpdateVille() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nom: string } }) =>
      adminService.updateVille(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'villes'] });
      toast.success('Ville mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });
}

export function useDeleteVille() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteVille(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'villes'] });
      toast.success('Ville supprimée avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

// Hook pour la gestion des communes
export function useCommunes() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'communes'],
    queryFn: adminService.getCommunes,
    enabled: isAuthenticated,
  });
}

export function useCreateCommune() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { nom: string; id_ville: string; image?: string; enabled: boolean }) => 
      adminService.createCommune(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'communes'] });
      toast.success('Commune créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });
}

export function useUpdateCommune() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nom: string; id_ville: string; image?: string; enabled: boolean } }) =>
      adminService.updateCommune(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'communes'] });
      toast.success('Commune mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });
}

export function useUpdateCommuneStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: number }) =>
      adminService.updateCommuneStatus(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'communes'] });
      toast.success('Statut de la commune mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du statut');
    },
  });
}

export function useDeleteCommune() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteCommune(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'communes'] });
      toast.success('Commune supprimée avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

// Hook pour la gestion des quartiers
export function useQuartiers() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'quartiers'],
    queryFn: adminService.getQuartiers,
    enabled: isAuthenticated,
  });
}

export function useCreateQuartier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => adminService.createQuartier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quartiers'] });
      toast.success('Quartier créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });
}

export function useUpdateQuartier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminService.updateQuartier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quartiers'] });
      toast.success('Quartier mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });
}

export function useUpdateQuartierStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: number }) =>
      adminService.updateQuartierStatus(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quartiers'] });
      toast.success('Statut du quartier mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du statut');
    },
  });
}

export function useDeleteQuartier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteQuartier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quartiers'] });
      toast.success('Quartier supprimé avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

// Hooks pour la gestion des utilisateurs admin
export function useAdminUsers(page = 1, limit = 10, search = '') {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'users', page, limit, search],
    queryFn: () => adminService.getAdminUsers(page, limit, search),
    enabled: isAuthenticated,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: string }) =>
      adminService.createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Administrateur créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; email: string; password?: string; role: string } }) =>
      adminService.updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Administrateur modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la modification');
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => adminService.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Administrateur supprimé avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

// Hooks pour la gestion des rôles
export function useRoles() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminService.getRoles(),
    enabled: isAuthenticated,
  });
}

export function useRole(id: number) {
  return useQuery({
    queryKey: ['admin', 'roles', id],
    queryFn: () => adminService.getRole(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; guard_name?: string }) =>
      adminService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      toast.success('Rôle créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      adminService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      toast.success('Rôle modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la modification');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => adminService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      toast.success('Rôle supprimé avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      adminService.updateRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      toast.success('Permissions mises à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    },
  });
}

// Hooks pour la gestion des permissions
export function usePermissions() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => adminService.getPermissions(),
    enabled: isAuthenticated,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; guard_name?: string }) =>
      adminService.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] });
      toast.success('Permission créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      adminService.updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] });
      toast.success('Permission modifiée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la modification');
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => adminService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] });
      toast.success('Permission supprimée avec succès');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression';
      toast.error(errorMessage, { duration: 5000 });
    },
  });
}

// Hooks pour la gestion des prix
export function useAdminPrix(page = 1, limit = 10, search = '') {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'prix', page, limit, search],
    queryFn: () => adminService.getPrix(page, limit, search),
    enabled: isAuthenticated,
  });
}

export function usePrixReferences() {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'prix', 'references'],
    queryFn: () => adminService.getPrixReferences(),
    enabled: isAuthenticated,
  });
}

export function useSousCategories(categorieCode: string) {
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('admin_token');
  
  return useQuery({
    queryKey: ['admin', 'prix', 'souscategories', categorieCode],
    queryFn: () => adminService.getSousCategories(categorieCode),
    enabled: isAuthenticated && !!categorieCode,
  });
}

export function useCreatePrix() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => adminService.createPrix(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'prix'] });
      toast.success('Prix créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });
}

export function useUpdatePrix() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminService.updatePrix(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'prix'] });
      toast.success('Prix modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la modification');
    },
  });
}

export function useDeletePrix() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => adminService.deletePrix(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'prix'] });
      toast.success('Prix supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    },
  });
}
