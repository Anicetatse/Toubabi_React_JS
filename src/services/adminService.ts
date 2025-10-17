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

export interface AnnonceAdmin {
  code: string;
  nom: string;
  description: string;
  image?: string; // JSON string avec array d'images
  images?: string[]; // Array d'images parsées
  prix_vente: string; // Converti en string depuis BigInt
  surface: number;
  piece: number;
  chambre: number;
  type_annonce: string;
  enabled: number;
  client_nom?: string;
  client_prenom?: string;
  client_email?: string;
  client_telephone?: string;
  commune_nom?: string;
  quartier_nom?: string;
  categorie_nom?: string;
  souscategorie_nom?: string;
  created_at: string;
  updated_at?: string;
}

export interface CommentaireAdmin {
  id: string;
  nom: string;
  commentaire: string;
  note: number | null;
  active: number;
  produit_code: string;
  produit_nom: string;
  produit_image: string | null;
  produit_type: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TypeAnnonceAdmin {
  id: string;
  nom: string; // Mappé depuis "libelle" dans la BD
  created_at: string | null;
  updated_at: string | null;
}

export interface CaracteristiqueAdmin {
  id: string;
  nom: string;
  active: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface VilleAdmin {
  id: string;
  nom: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CommuneAdmin {
  id: string;
  nom: string;
  id_ville: string;
  ville_nom: string;
  image: string | null;
  enabled: number;
  total_annonces: number;
  annonces_actives: number;
  annonces_en_attente: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface QuartierAdmin {
  id: string;
  nom: string;
  id_commune: string;
  commune_nom: string;
  ville_nom: string;
  images: string | null;
  enabled: number;
  lat: number | null;
  lng: number | null;
  total_annonces?: number;
  annonces_actives?: number;
  annonces_en_attente?: number;
  prix_min_location: string | null;
  prix_moy_location: string | null;
  prix_max_location: string | null;
  prix_min_vente: string | null;
  prix_moy_vente: string | null;
  prix_max_vente: string | null;
  prix_venal: string | null;
  prix_marchand: string | null;
  prix_moyen: string | null;
  created_at: string | null;
  updated_at: string | null;
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

  // Méthodes pour la gestion des annonces
  getAnnonces = async (page: number, limit: number, search: string, status?: string): Promise<{
    data: AnnonceAdmin[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    });

    const response = await axios.get(`${API_URL}/api/admin/annonces?${params}`, {
      headers: this.getAuthHeaders(),
    });

    return response.data;
  }

  getAnnonceByCode = async (code: string): Promise<AnnonceAdmin> => {
    const response = await axios.get(`${API_URL}/api/admin/annonces/${code}`, {
      headers: this.getAuthHeaders(),
    });

    return response.data.data;
  }

  updateAnnonceStatus = async (code: string, enabled: number): Promise<void> => {
    await axios.patch(`${API_URL}/api/admin/annonces/${code}`, {
      enabled,
    }, {
      headers: this.getAuthHeaders(),
    });
  }

  updateAnnonce = async (code: string, data: {
    nom: string;
    description: string;
    prix_vente: string;
    surface: number;
    piece: number;
    chambre: number;
    type_annonce: string;
    images?: string[];
  }): Promise<void> => {
    await axios.put(`${API_URL}/api/admin/annonces/${code}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteAnnonce = async (code: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/annonces/${code}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAnnoncesStats = async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    thisMonth: number;
  }> => {
    const response = await axios.get(`${API_URL}/api/admin/annonces/stats`, {
      headers: this.getAuthHeaders(),
    });

    return response.data.data;
  }

  // Méthodes pour la gestion des commentaires
  getCommentaires = async (page: number, limit: number, search: string, status?: string): Promise<{
    data: CommentaireAdmin[];
    total: number;
    page: number;
    limit: number;
    stats: {
      total: number;
      active: number;
      inactive: number;
      thisMonth: number;
    };
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    });

    const response = await axios.get(`${API_URL}/api/admin/commentaires?${params}`, {
      headers: this.getAuthHeaders(),
    });

    return response.data;
  }

  updateCommentaireStatus = async (id: string, active: number): Promise<void> => {
    await axios.patch(`${API_URL}/api/admin/commentaires/${id}`, {
      active,
    }, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteCommentaire = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/commentaires/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getCommentairesStats = async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    thisMonth: number;
  }> => {
    const response = await axios.get(`${API_URL}/api/admin/commentaires/stats`, {
      headers: this.getAuthHeaders(),
    });

    return response.data;
  }

  // Méthodes pour la gestion des types d'annonces
  getTypeAnnonces = async (): Promise<TypeAnnonceAdmin[]> => {
    const response = await axios.get(`${API_URL}/api/admin/type-annonces`, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data;
  }

  createTypeAnnonce = async (data: { nom: string }): Promise<TypeAnnonceAdmin> => {
    const response = await axios.post(`${API_URL}/api/admin/type-annonces`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data;
  }

  updateTypeAnnonce = async (id: string, data: { nom: string }): Promise<void> => {
    await axios.put(`${API_URL}/api/admin/type-annonces/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteTypeAnnonce = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/type-annonces/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Méthodes pour la gestion des caractéristiques
  getCaracteristiques = async (): Promise<CaracteristiqueAdmin[]> => {
    const response = await axios.get(`${API_URL}/api/admin/caracteristiques`, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data;
  }

  createCaracteristique = async (data: { nom: string }): Promise<CaracteristiqueAdmin> => {
    const response = await axios.post(`${API_URL}/api/admin/caracteristiques`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data;
  }

  updateCaracteristique = async (id: string, data: { nom: string }): Promise<void> => {
    await axios.put(`${API_URL}/api/admin/caracteristiques/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateCaracteristiqueStatus = async (id: string, active: number): Promise<void> => {
    await axios.patch(`${API_URL}/api/admin/caracteristiques/${id}`, {
      active,
    }, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteCaracteristique = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/caracteristiques/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Méthodes pour la gestion des villes
  getVilles = async (): Promise<VilleAdmin[]> => {
    const response = await axios.get(`${API_URL}/api/admin/villes`, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data;
  }

  createVille = async (data: { nom: string }): Promise<VilleAdmin> => {
    const response = await axios.post(`${API_URL}/api/admin/villes`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data;
  }

  updateVille = async (id: string, data: { nom: string }): Promise<void> => {
    await axios.put(`${API_URL}/api/admin/villes/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteVille = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/villes/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Méthodes pour la gestion des communes
  getCommunes = async (): Promise<CommuneAdmin[]> => {
    const response = await axios.get(`${API_URL}/api/admin/communes`, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data;
  }

  createCommune = async (data: { nom: string; id_ville: string; image?: string; enabled: boolean }): Promise<CommuneAdmin> => {
    const response = await axios.post(`${API_URL}/api/admin/communes`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data;
  }

  updateCommune = async (id: string, data: { nom: string; id_ville: string; image?: string; enabled: boolean }): Promise<void> => {
    await axios.put(`${API_URL}/api/admin/communes/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateCommuneStatus = async (id: string, enabled: number): Promise<void> => {
    await axios.patch(`${API_URL}/api/admin/communes/${id}/toggle`, {
      enabled,
    }, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteCommune = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/communes/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Méthodes pour la gestion des quartiers
  getQuartiers = async (): Promise<QuartierAdmin[]> => {
    const response = await axios.get(`${API_URL}/api/admin/quartiers`, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data;
  }

  createQuartier = async (data: any): Promise<QuartierAdmin> => {
    const response = await axios.post(`${API_URL}/api/admin/quartiers`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data;
  }

  updateQuartier = async (id: string, data: any): Promise<void> => {
    await axios.put(`${API_URL}/api/admin/quartiers/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateQuartierStatus = async (id: string, enabled: number): Promise<void> => {
    await axios.patch(`${API_URL}/api/admin/quartiers/${id}/toggle`, {
      enabled,
    }, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteQuartier = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/quartiers/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}

export const adminService = new AdminService();
