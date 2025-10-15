import { apiClient } from '@/config/api';
import { ApiResponse, Service, PharmacieDeGarde } from '@/types';

export const serviceService = {
  async getPharmacies(search?: string): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      '/services/pharmacies',
      { params: { search } }
    );
    return response.data.data!;
  },

  async getPharmaciesDeGarde(search?: string): Promise<PharmacieDeGarde[]> {
    const response = await apiClient.get<
      ApiResponse<PharmacieDeGarde[]>
    >('/services/pharmacies-de-garde', { params: { search } });
    return response.data.data!;
  },

  async getHospitaliers(search?: string): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      '/services/hospitaliers',
      { params: { search } }
    );
    return response.data.data!;
  },

  async getHoteliers(search?: string): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      '/services/hoteliers',
      { params: { search } }
    );
    return response.data.data!;
  },

  async getStations(search?: string): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      '/services/stations',
      { params: { search } }
    );
    return response.data.data!;
  },

  async getServicesPublics(search?: string): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      '/services/services-publics',
      { params: { search } }
    );
    return response.data.data!;
  },

  async getEnseignements(search?: string): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      '/services/enseignements',
      { params: { search } }
    );
    return response.data.data!;
  },

  async getCommerces(search?: string): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      '/services/commerces',
      { params: { search } }
    );
    return response.data.data!;
  },

  async getBanques(search?: string): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      '/services/banques',
      { params: { search } }
    );
    return response.data.data!;
  },

  async getIndustries(search?: string): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service[]>>(
      '/services/industries',
      { params: { search } }
    );
    return response.data.data!;
  },
};

