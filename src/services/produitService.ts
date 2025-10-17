import { apiClient } from '@/config/api';
import { ApiResponse, Produit, PaginatedResponse, Commentaire } from '@/types';

export interface SearchFilters {
  categorie_id?: number;
  sous_categorie_id?: number;
  type_annonce_id?: number;
  quartier_id?: number;
  commune_id?: number;
  ville_id?: number;
  prix_min?: number;
  prix_max?: number;
  surface_min?: number;
  surface_max?: number;
  nombre_pieces?: number;
  nombre_chambres?: number;
  search?: string;
}

export const produitService = {
  async getAll(
    page = 1,
    filters?: SearchFilters
  ): Promise<PaginatedResponse<Produit>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Produit>>>(
      '/biens',
      {
        params: { page, ...filters },
      }
    );
    return response.data.data!;
  },

  async getById(id: number): Promise<Produit> {
    const response = await apiClient.get<ApiResponse<Produit>>(`/biens/${id}`);
    return response.data.data!;
  },

  async search(query: string, filters?: SearchFilters): Promise<Produit[]> {
    const response = await apiClient.get<ApiResponse<Produit[]>>(
      '/biens/search',
      {
        params: { q: query, ...filters },
      }
    );
    return response.data.data!;
  },

  async getFeatured(): Promise<Produit[]> {
    const response = await apiClient.get<ApiResponse<Produit[]>>(
      '/biens/featured'
    );
    return response.data.data!;
  },

  async getRecent(limit = 10): Promise<Produit[]> {
    const response = await apiClient.get<ApiResponse<Produit[]>>(
      '/biens/recent',
      {
        params: { limit },
      }
    );
    return response.data.data!;
  },

  async addComment(
    produit_code: string,
    data: {
      nom: string;
      commentaire: string;
      note: number; // 1-5
    }
  ): Promise<Commentaire> {
    const response = await apiClient.post<ApiResponse<Commentaire>>(
      `/commentaires`,
      { ...data, produit_code }
    );
    return response.data.data!;
  },

  async getComments(produit_code: string): Promise<Commentaire[]> {
    const response = await apiClient.get<ApiResponse<Commentaire[]>>(
      `/commentaires`,
      {
        params: { produit_code }
      }
    );
    return response.data.data!;
  },

  // Pour les utilisateurs authentifiés
  async create(data: FormData): Promise<Produit> {
    const response = await apiClient.post<ApiResponse<Produit>>(
      '/biens',
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  async update(id: number, data: FormData): Promise<Produit> {
    const response = await apiClient.post<ApiResponse<Produit>>(
      `/biens/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/biens/${id}`);
  },

  async getMine(): Promise<Produit[]> {
    const response = await apiClient.get<ApiResponse<Produit[]>>(
      '/client/annonces'
    );
    return response.data.data!;
  },
};

