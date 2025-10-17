'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlistService';
import { Wishlist } from '@/types';
import toast from 'react-hot-toast';

export function useWishlist() {
  const queryClient = useQueryClient();

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

  // Récupérer tous les favoris SEULEMENT si authentifié
  const { data: wishlists = [], isLoading } = useQuery<Wishlist[]>({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: isAuthenticated, // Ne charge que si authentifié
  });

  // Ajouter un bien aux favoris
  const addMutation = useMutation({
    mutationFn: (produitCode: string) => wishlistService.add(produitCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Ajouté aux favoris');
    },
    onError: () => {
      toast.error('Erreur lors de l\'ajout aux favoris');
    },
  });

  // Retirer un bien des favoris
  const removeMutation = useMutation({
    mutationFn: wishlistService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Retiré des favoris');
    },
    onError: () => {
      toast.error('Erreur lors du retrait des favoris');
    },
  });

  // Toggle un bien dans les favoris
  const toggleMutation = useMutation({
    mutationFn: (produitCode: string) => wishlistService.toggle(produitCode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      if (data.added) {
        toast.success('Ajouté aux favoris');
      } else {
        toast.success('Retiré des favoris');
      }
    },
    onError: () => {
      toast.error('Erreur lors de la modification des favoris');
    },
  });

  // Vérifier si un bien est dans les favoris
  const isInWishlist = (produitCode: string) => {
    return wishlists.some((item) => item.code_produit === produitCode);
  };

  // Obtenir l'ID du wishlist pour un bien donné
  const getWishlistId = (produitCode: string) => {
    const wishlistItem = wishlists.find((item) => item.code_produit === produitCode);
    return wishlistItem?.id;
  };

  return {
    wishlists,
    wishlistCount: wishlists.length,
    isLoading,
    addToWishlist: addMutation.mutate,
    removeFromWishlist: removeMutation.mutate,
    toggleWishlist: toggleMutation.mutate,
    isInWishlist,
    getWishlistId,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isToggling: toggleMutation.isPending,
  };
}

