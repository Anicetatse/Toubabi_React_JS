import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface DashboardStats {
  biens: {
    total: number;
    actifs: number;
    inactifs: number;
  };
  utilisateurs: {
    total: number;
    admins: number;
  };
  commandes: {
    total: number;
    enAttente: number;
    traitees: number;
  };
  geographie: {
    villes: number;
    communes: number;
    quartiers: number;
  };
  derniersBiens: Array<{
    id: number;
    code: string;
    nom: string;
    prix_vente: number;
    enabled: boolean;
    client_nom: string;
    quartier_nom: string;
    commune_nom: string;
    created_at: string;
  }>;
  activitesRecentes: Array<{
    action: string;
    description: string;
    date: string;
  }>;
  statsParCommune: Array<{
    id: number;
    nom: string;
    total_biens: number;
    biens_actifs: number;
    biens_en_attente: number;
  }>;
}

export interface BienAdmin {
  id: number;
  code: string;
  nom: string;
  description: string;
  prix_vente: number;
  surface: number;
  piece: number;
  chambre: number;
  enabled: boolean;
  client_owner_id: number;
  client_nom?: string;
  quartier_nom?: string;
  commune_nom?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientAdmin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommandeAdmin {
  id: number;
  numero_commande: string;
  status: number; // 0 = en_attente, 1 = traitee, 2 = annulee
  nom: string;
  email?: string;
  numero?: string; // téléphone
  code_produit: string;
  detail?: string;
  description?: string;
  client_nom?: string;
  created_at: string;
  updated_at: string;
}

export interface CategorieAdmin {
  id: number; // Pas dans la BD, utilisé pour compatibilité UI
  code: string; // Clé primaire dans la BD
  nom: string;
  images?: string;
  enabled: boolean;
  pro: boolean;
  nombre_produits?: number; // Ajouté par la requête SQL
  created_at: string;
  updated_at: string;
}

class AdminService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await axios.get(`${API_URL}/api/admin/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Gestion des biens
  async getBiens(page = 1, limit = 10, search = ''): Promise<{ biens: BienAdmin[]; total: number }> {
    const response = await axios.get(`${API_URL}/api/admin/biens`, {
      headers: this.getAuthHeaders(),
      params: { page, limit, search },
    });
    return response.data;
  }

  async getBienById(id: number): Promise<BienAdmin> {
    const response = await axios.get(`${API_URL}/api/admin/biens/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async updateBien(id: number, data: Partial<BienAdmin>): Promise<BienAdmin> {
    const response = await axios.put(`${API_URL}/api/admin/biens/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async deleteBien(id: number): Promise<void> {
    await axios.delete(`${API_URL}/api/admin/biens/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  async toggleBienStatus(id: number, enabled: boolean): Promise<BienAdmin> {
    const response = await axios.patch(`${API_URL}/api/admin/biens/${id}/toggle`, { enabled }, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Gestion des clients
  async getClients(page = 1, limit = 10, search = ''): Promise<{ clients: ClientAdmin[]; total: number }> {
    const response = await axios.get(`${API_URL}/api/admin/clients`, {
      headers: this.getAuthHeaders(),
      params: { page, limit, search },
    });
    return response.data;
  }

  async getClientById(id: number): Promise<ClientAdmin> {
    const response = await axios.get(`${API_URL}/api/admin/clients/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async updateClient(id: number, data: Partial<ClientAdmin>): Promise<ClientAdmin> {
    const response = await axios.put(`${API_URL}/api/admin/clients/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async deleteClient(id: number): Promise<void> {
    await axios.delete(`${API_URL}/api/admin/clients/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  async toggleClientStatus(id: number, enabled: boolean): Promise<ClientAdmin> {
    const response = await axios.patch(`${API_URL}/api/admin/clients/${id}/toggle`, { enabled }, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Gestion des commandes
  async getCommandes(page = 1, limit = 10, search = '', status?: number): Promise<{ commandes: CommandeAdmin[]; total: number }> {
    const response = await axios.get(`${API_URL}/api/admin/commandes`, {
      headers: this.getAuthHeaders(),
      params: { page, limit, search, status },
    });
    return response.data;
  }

  async getCommandeById(id: number): Promise<CommandeAdmin> {
    const response = await axios.get(`${API_URL}/api/admin/commandes/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async updateCommandeStatus(id: number, status: number): Promise<CommandeAdmin> {
    const response = await axios.patch(`${API_URL}/api/admin/commandes/${id}`, { status }, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Gestion des catégories
  async getCategories(): Promise<CategorieAdmin[]> {
    const response = await axios.get(`${API_URL}/api/admin/categories`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async createCategorie(data: Omit<CategorieAdmin, 'id' | 'created_at' | 'updated_at' | 'nombre_produits'>): Promise<CategorieAdmin> {
    const response = await axios.post(`${API_URL}/api/admin/categories`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async updateCategorie(code: string, data: Partial<CategorieAdmin>): Promise<CategorieAdmin> {
    const response = await axios.put(`${API_URL}/api/admin/categories/${code}`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async deleteCategorie(code: string): Promise<void> {
    await axios.delete(`${API_URL}/api/admin/categories/${code}`, {
      headers: this.getAuthHeaders(),
    });
  }
}

export const adminService = new AdminService();
