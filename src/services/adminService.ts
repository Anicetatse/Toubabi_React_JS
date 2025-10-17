import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface DashboardStats {
  // EXACTEMENT comme le dashboard Laravel
  commandes: {
    nonTraitees: number;  // status = 0
    traitees: number;     // status = 1
  };
  utilisateurs: {
    total: number;        // count(clients)
    admins: number;       // count(users)
  };
  biens: {
    actifs: number;       // enabled = 1
    nonActifs: number;    // enabled = 0
    total: number;        // total
  };
  geographie: {
    villes: number;
    communes: number;
    quartiers: number;
  };
  dernierProduit: {
    code: string;
    nom: string;
    created_at: string | null;
  } | null;
  statsParCommune: Array<{
    id: number;
    nom: string;
    total_biens: number;       // getAnnonceCount()
    biens_approuves: number;   // getAnnonceActifCount()
    biens_en_attente: number;  // getAnnonceNonActifCount()
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
  private getAuthHeaders = () => {
    // Utiliser le token admin séparé
    const token = localStorage.getItem('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Dashboard
  getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await axios.get(`${API_URL}/api/admin/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Gestion des biens
  getBiens = async (page = 1, limit = 10, search = ''): Promise<{ biens: BienAdmin[]; total: number }> => {
    const response = await axios.get(`${API_URL}/api/admin/biens`, {
      headers: this.getAuthHeaders(),
      params: { page, limit, search },
    });
    return response.data;
  }

  getBienById = async (id: number): Promise<BienAdmin> => {
    const response = await axios.get(`${API_URL}/api/admin/biens/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  updateBien = async (id: number, data: Partial<BienAdmin>): Promise<BienAdmin> => {
    const response = await axios.put(`${API_URL}/api/admin/biens/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  deleteBien = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/biens/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  toggleBienStatus = async (id: number, enabled: boolean): Promise<BienAdmin> => {
    const response = await axios.patch(`${API_URL}/api/admin/biens/${id}/toggle`, { enabled }, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Gestion des clients
  getClients = async (page = 1, limit = 10, search = ''): Promise<{ clients: ClientAdmin[]; total: number }> => {
    const response = await axios.get(`${API_URL}/api/admin/clients`, {
      headers: this.getAuthHeaders(),
      params: { page, limit, search },
    });
    return response.data;
  }

  getClientById = async (id: number): Promise<ClientAdmin> => {
    const response = await axios.get(`${API_URL}/api/admin/clients/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  updateClient = async (id: number, data: Partial<ClientAdmin>): Promise<ClientAdmin> => {
    const response = await axios.put(`${API_URL}/api/admin/clients/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  deleteClient = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/clients/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  toggleClientStatus = async (id: number, enabled: boolean): Promise<ClientAdmin> => {
    const response = await axios.patch(`${API_URL}/api/admin/clients/${id}/toggle`, { enabled }, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Gestion des commandes
  getCommandes = async (page = 1, limit = 10, search = '', status?: number): Promise<{ commandes: CommandeAdmin[]; total: number }> => {
    const response = await axios.get(`${API_URL}/api/admin/commandes`, {
      headers: this.getAuthHeaders(),
      params: { page, limit, search, status },
    });
    return response.data;
  }

  getCommandeById = async (id: number): Promise<CommandeAdmin> => {
    const response = await axios.get(`${API_URL}/api/admin/commandes/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  updateCommandeStatus = async (id: number, status: number): Promise<CommandeAdmin> => {
    const response = await axios.patch(`${API_URL}/api/admin/commandes/${id}`, { status }, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Gestion des catégories
  getCategories = async (): Promise<CategorieAdmin[]> => {
    const response = await axios.get(`${API_URL}/api/admin/categories`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  createCategorie = async (data: Omit<CategorieAdmin, 'id' | 'created_at' | 'updated_at' | 'nombre_produits'>): Promise<CategorieAdmin> => {
    const response = await axios.post(`${API_URL}/api/admin/categories`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  updateCategorie = async (code: string, data: Partial<CategorieAdmin>): Promise<CategorieAdmin> => {
    const response = await axios.put(`${API_URL}/api/admin/categories/${code}`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  deleteCategorie = async (code: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/categories/${code}`, {
      headers: this.getAuthHeaders(),
    });
  }
}

export const adminService = new AdminService();
