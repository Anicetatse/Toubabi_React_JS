import { apiClient } from '@/config/api';
import { ApiResponse, Pays, Ville, Commune, Quartier } from '@/types';

export const locationService = {
  async getPays(): Promise<Pays[]> {
    const response = await apiClient.get<ApiResponse<Pays[]>>('/pays');
    return response.data.data!;
  },

  async getVilles(paysId?: number): Promise<Ville[]> {
    const response = await apiClient.get<ApiResponse<Ville[]>>('/villes', {
      params: paysId ? { pays_id: paysId } : undefined,
    });
    return response.data.data!;
  },

  async getCommunes(villeId?: number): Promise<Commune[]> {
    const response = await apiClient.get<ApiResponse<Commune[]>>('/communes', {
      params: villeId ? { ville_id: villeId } : undefined,
    });
    return response.data.data!;
  },

  async getQuartiers(communeId?: number): Promise<Quartier[]> {
    const response = await apiClient.get<ApiResponse<Quartier[]>>(
      '/quartiers',
      {
        params: communeId ? { commune_id: communeId } : undefined,
      }
    );
    return response.data.data!;
  },

  async getQuartierById(id: number): Promise<Quartier> {
    const response = await apiClient.get<ApiResponse<Quartier>>(
      `/quartiers/${id}`
    );
    return response.data.data!;
  },

  // Pour la cartographie
  async getQuartiersWithPrices(): Promise<Quartier[]> {
    const response = await apiClient.get<ApiResponse<Quartier[]>>(
      '/cartographie/quartiers'
    );
    return response.data.data!;
  },
};

