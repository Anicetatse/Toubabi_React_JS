// Types de base pour le projet Toubabi

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  image?: string;
  type_compte: string; // 'particulier' | 'agent_professionnel' | 'agent_informel' | 'agence'
  created_at?: string;
  updated_at?: string;
}

export interface Pays {
  id: number;
  nom: string;
  code?: string;
}

export interface Ville {
  id: number;
  nom: string;
  pays_id: number;
  pays?: Pays;
}

export interface Commune {
  id: number;
  nom: string;
  ville_id: number;
  ville?: Ville;
}

export interface Quartier {
  id: string;
  id_commune: string;
  nom: string;
  lat?: string | null;
  lng?: string | null;
  prix_min_location?: string | null;
  prix_moy_location?: string | null;
  prix_max_location?: string | null;
  prix_min_vente?: string | null;
  prix_moy_vente?: string | null;
  prix_max_vente?: string | null;
  prix_venal?: string | null;
  prix_marchand?: string | null;
  prix_moyen?: string | null;
  images?: string | null;
  enabled: number;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  commune?: Commune; // Relation avec la commune
  // Champs supplémentaires utilisés par les cartes héritées du PHP
  nbre_biens?: number;
  nb_biens?: number;
  nbre_location?: number;
  nbre_vente?: number;
}

export interface Categorie {
  id: number;
  nom: string;
  description?: string;
  image?: string;
}

export interface SousCategorie {
  id: number;
  nom: string;
  categorie_id: number;
  categorie?: Categorie;
}

export interface TypeAnnonce {
  id: number;
  nom: string;
  description?: string;
}

export interface Caracteristique {
  id: number;
  nom: string;
  type: 'text' | 'number' | 'select' | 'checkbox';
  options?: string[];
}

export interface Image {
  id: number;
  url: string;
  alt?: string;
}

export interface Produit {
  id: number;
  code?: string; // Code unique du produit
  titre: string;
  description: string;
  prix: number;
  prix_vente?: number; // Alias pour compatibilité avec la base de données
  surface?: number;
  nombre_pieces?: number;
  nombre_chambres?: number;
  nombre_salles_bain?: number;
  categorie_id: number;
  sous_categorie_id?: number;
  type_annonce_id: number;
  quartier_id: number;
  user_id: number;
  client_owner_id?: number; // ID du client propriétaire
  enabled?: number; // 0 = en attente, 1 = approuvée
  statut: 'actif' | 'vendu' | 'loue' | 'en_attente';
  images?: Image[];
  categorie?: Categorie;
  sous_categorie?: SousCategorie;
  type_annonce?: TypeAnnonce;
  quartier?: Quartier;
  user?: User;
  caracteristiques?: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: number;
  id_client: number;
  code_produit: string;
  produit?: Produit;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  produit_id: number;
  produit: Produit;
  quantity: number;
}

export interface Commande {
  id: number;
  user_id: number;
  total: number;
  statut: 'en_attente' | 'validee' | 'livree' | 'annulee';
  details?: CommandeDetail[];
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface CommandeDetail {
  id: number;
  commande_id: number;
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
  produit?: Produit;
}

export interface Commentaire {
  id: number;
  nom: string;           // Nom de l'auteur du commentaire
  commentaire: string;   // Texte du commentaire
  note: number | null;   // Note de 1 à 5 étoiles (nullable)
  active: number;        // 1 = actif/approuvé, 0 = en modération
  produit_code: string;  // Code du produit associé
  created_at: string;
  updated_at?: string;
  produit?: Produit;     // Relation optionnelle avec le produit
}

// Services
export interface Service {
  id: number;
  nom: string;
  description?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  quartier_id?: number;
  quartier?: Quartier;
  latitude?: number;
  longitude?: number;
  type: 'pharmacie' | 'pharmacie_de_garde' | 'hopital' | 'hotel' | 'station' | 'service_public' | 'enseignement' | 'commerce' | 'banque' | 'industrie';
  created_at: string;
}

export interface PharmacieDeGarde extends Service {
  date_debut: string;
  date_fin: string;
}

// Templates et menus
export interface Menu {
  id: number;
  titre: string;
  lien?: string;
  ordre: number;
}

export interface SousMenu {
  id: number;
  titre: string;
  contenu?: string;
  menu_id: number;
  menu?: Menu;
  images?: TemplateImage[];
}

export interface TemplateImage {
  id: number;
  url: string;
  titre?: string;
  description?: string;
  sous_menu_id?: number;
}

// Estimation
export interface Estime {
  id: number;
  user_id?: number;
  type_construction: string;
  surface: number;
  nombre_etages: number;
  finition: 'economique' | 'standard' | 'haut_de_gamme';
  montant_estime: number;
  email?: string;
  created_at: string;
}

// Alerte
export interface Alerte {
  id: number;
  user_id: number;
  criteres: {
    type_bien?: string;
    prix_min?: number;
    prix_max?: number;
    quartier_ids?: number[];
    surface_min?: number;
  };
  frequence: 'quotidien' | 'hebdomadaire';
  active: boolean;
  created_at: string;
}

// Contact
export interface Contact {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
  lu: boolean;
  created_at: string;
}

// Slider
export interface Slider {
  id: number;
  titre: string;
  sous_titre?: string;
  image: string;
  lien?: string;
  ordre: number;
  actif: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { [key: string]: string[] };
}

