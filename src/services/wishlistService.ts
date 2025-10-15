import { apiClient } from '@/config/api';
import { ApiResponse, Wishlist } from '@/types';

export const wishlistService = {
  async getAll(): Promise<Wishlist[]> {
    const response = await apiClient.get<ApiResponse<Wishlist[]>>(
      '/wishlist'
    );
    return response.data.data!;
  },

  async add(produitId: number): Promise<Wishlist> {
    const response = await apiClient.post<ApiResponse<Wishlist>>(
      '/wishlist',
      { produit_id: produitId }
    );
    return response.data.data!;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/wishlist/${id}`);
  },

  async toggle(produitId: number): Promise<{ added: boolean }> {
    const response = await apiClient.post<ApiResponse<{ added: boolean }>>(
      '/wishlist/toggle',
      { produit_id: produitId }
    );
    return response.data.data!;
  },
};

