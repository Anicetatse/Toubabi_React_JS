# 🏠 Toubabi - Plateforme Immobilière

Plateforme immobilière moderne en **Next.js 15**, **TypeScript** et **Tailwind CSS**, réplique complète du projet PHP Laravel original avec connexion directe à la base de données MySQL.

---

## ✨ Fonctionnalités

### 📱 Interface Utilisateur
- **🗺️ Cartographie interactive** - Carte Mapbox avec prix des quartiers (données réelles BDD)
- **🏠 Gestion des biens** - Listing, détails, recherche et filtres avancés
- **🔍 Recherche avancée** - Filtres multicritères (prix, surface, localisation)
- **🏪 Annuaire des services** - 10 types de services (pharmacies, hôtels, banques, etc.)
- **📱 100% Responsive** - Interface adaptée mobile, tablette et desktop

### 👤 Espace Client
- **🔐 Authentification** - Connexion, inscription, gestion profil
- **📋 Dashboard personnel** - Vue d'ensemble et statistiques
- **📝 Mes annonces** - Créer, modifier, gérer mes biens
- **💼 Mes commandes** - Historique complet
- **❤️ Wishlist** - Favoris et biens sauvegardés
- **🛒 Panier** - Gestion panier d'achats
- **📍 Mon adresse** - Gestion adresse livraison

### 👨‍💼 Panneau d'Administration (39 pages)
- **📊 Dashboard** - Statistiques et vue d'ensemble
- **🏢 Gestion biens** - CRUD complet (biens, catégories, types, caractéristiques)
- **👥 Gestion clients** - Liste et modération utilisateurs
- **💳 Gestion commandes** - Suivi des transactions
- **🏪 Gestion services** - 10 types de services
- **📍 Gestion localisation** - Pays, villes, communes, quartiers, prix
- **📰 Gestion contenu** - Sliders, templates, menus, articles
- **💬 Communications** - Messages, commentaires, estimations
- **⚙️ Paramètres** - Configuration globale

### 🏗️ Outils
- **🧮 Estimation de projets** - Calculateur de coûts de construction
- **📧 Contact** - Formulaire de contact
- **📚 Tout savoir** - Guides et articles immobiliers

---

## 🛠️ Stack Technique

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React avec App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique complet
- **[Tailwind CSS](https://tailwindcss.com/)** - Design moderne et responsive
- **[shadcn/ui](https://ui.shadcn.com/)** - Composants UI réutilisables
- **[Mapbox GL](https://www.mapbox.com/)** - Cartographie interactive

### Gestion des données
- **[Prisma ORM](https://www.prisma.io/)** - Connexion directe MySQL
- **[React Query](https://tanstack.com/query)** - Cache et gestion état serveur
- **[Axios](https://axios-http.com/)** - Client HTTP
- **[React Hook Form](https://react-hook-form.com/)** - Gestion formulaires
- **[Zod](https://zod.dev/)** - Validation des données

---

## 📦 Installation

### Prérequis

- **Node.js 18+** et npm
- **XAMPP** avec MySQL démarré
- **Base de données `toubabi`** existante

### Étapes d'installation

**1. Installer les dépendances**
```bash
cd "Toubabi_React_JS"
npm install
```

**2. Configuration des variables d'environnement**

Le fichier `.env.example` contient toutes les variables. Copiez-le :

```bash
cp .env.example .env
```

Éditez `.env` avec vos informations :

```env
# Base de données MySQL (XAMPP)
DATABASE_URL="mysql://root@127.0.0.1:3306/toubabi"

# Mapbox (obtenez un token gratuit sur https://account.mapbox.com/)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.votre_token_mapbox

# Email SMTP (déjà configuré avec vos credentials)
MAIL_HOST=virtus225one@gmail.com
# ... etc
```

**3. Générer le client Prisma**
```bash
npx prisma generate
```

Vous devriez voir :
```
✔ Generated Prisma Client (v6.17.1) to ./node_modules/@prisma/client
```

**4. Lancer le serveur**
```bash
npm run dev
```

**5. Accéder au site**
- **Site public :** http://localhost:3000
- **Admin :** http://localhost:3000/admin/dashboard
- **Espace client :** http://localhost:3000/mon-espace/dashboard

---

## 📁 Structure du Projet

```
Toubabi_React_JS/
├── public/
│   ├── assets/
│   │   ├── css/ (styles.css, colors.css du PHP)
│   │   ├── images/ (toutes images PHP copiées)
│   │   └── js/ (maps.js, jQuery, etc.)
│   ├── videos/ (4 vidéos)
│   ├── lib/ & library/ (bibliothèques JS)
│   └── logo.png
├── prisma/
│   └── schema.prisma (263 lignes, 20+ modèles)
├── src/
│   ├── app/
│   │   ├── api/ (15 API Routes - connexion BDD)
│   │   ├── admin/ (39 pages admin)
│   │   ├── mon-espace/ (14 pages client)
│   │   ├── services/ (11 pages)
│   │   ├── biens/ (2 pages)
│   │   └── ... (83 pages au total)
│   ├── components/
│   │   ├── admin/ (AdminLayout, AdminCrudTable)
│   │   ├── layout/ (Header, Footer)
│   │   ├── ui/ (16 composants shadcn/ui)
│   │   ├── BienCard.tsx
│   │   ├── Map.tsx
│   │   ├── ServiceList.tsx
│   │   └── ClientMenu.tsx
│   ├── contexts/ (AuthContext, CartContext)
│   ├── services/ (5 services API)
│   ├── types/ (265 lignes TypeScript)
│   ├── config/ (api.ts, queryClient.ts)
│   └── lib/ (prisma.ts)
├── .env (configuration)
├── .env.example (template)
└── README.md (ce fichier)
```

---

## 🔌 Connexion Base de Données

### Architecture
Ce projet utilise une **connexion directe à MySQL** (pas d'API Laravel intermédiaire) :

```
Pages React
    ↓
React Query
    ↓
API Routes Next.js (/app/api/*)
    ↓
Prisma ORM
    ↓
MySQL (XAMPP - Base: toubabi)
```

### API Routes créées (15+)

**Biens**
- `GET /api/biens` - Liste avec filtres et pagination
- `GET /api/biens/[id]` - Détail d'un bien

**Localisation**
- `GET /api/quartiers` - Tous quartiers avec prix
- `GET /api/communes` - Toutes communes
- `GET /api/villes` - Toutes villes
- `GET /api/pays` - Tous pays

**Admin**
- `GET /api/admin/categories` - Catégories
- `GET /api/admin/quartiers` - Quartiers admin
- `GET /api/commandes` - Commandes
- `GET /api/contact` - Messages contact
- `GET /api/estimations` - Estimations
- `GET /api/sliders` - Sliders

---

## 📊 Pages Créées (83 pages)

### PUBLIC (18)
Accueil, Biens, Services (x11), Estimation, Contact, Apropos, etc.

### CLIENT (14)
Dashboard, Annonces, Commandes, Profil, Wishlist, Panier, Checkout, etc.

### ADMIN (39)
Dashboard, Biens, Catégories, Clients, Commandes, Services (x10), Localisation (x6), Contenu (x5), Communications (x4), Paramètres, etc.

### AUTH (4)
Login, Register, Mot de passe perdu, Reset

### AUTRES (8)
Tout savoir, Stats, Construire, Vendre, etc.

---

## 🎨 Design

Le design est **100% fidèle au projet PHP** :
- ✅ Thème **blue-skin** (identique)
- ✅ CSS du PHP copiés (styles.css, colors.css)
- ✅ Police **Arkhip** (CDN fonts)
- ✅ Logo et favicon Toubabi originaux
- ✅ Preloader animé (cercles bleus)
- ✅ **64 MB d'assets** copiés du PHP

---

## ⚙️ Configuration

### Base de données MySQL (XAMPP)
```
Hôte : 127.0.0.1:3306
Base : toubabi
User : root
Pass : (vide)
```

### Configuration Email SMTP
Déjà configurée dans `.env.example` avec vos credentials

### PayPal Sandbox
Credentials déjà configurés dans `.env.example`

### Mapbox
Obtenez un token gratuit sur https://account.mapbox.com/

---

## 🚀 Commandes

```bash
npm run dev      # Développement (http://localhost:3000)
npm run build    # Build production
npm start        # Serveur production
npm run lint     # Vérifier le code
npx prisma studio # Interface BDD (optionnel)
```

---

## 📝 Notes Importantes

### Connexion BDD
- La BDD MySQL doit être **démarrée dans XAMPP**
- Le schéma Prisma est déjà créé et correspond à la BDD Laravel
- Les données sont récupérées en temps réel depuis MySQL

### Assets
- Tous les assets du PHP sont copiés dans `/public`
- Les chemins sont identiques : `/assets/images/...`, `/videos/...`, etc.
- Design 100% fidèle au projet original

### Pages avec vraies données BDD
- ✅ `/biens` - Liste biens
- ✅ `/biens/[id]` - Détail bien
- ✅ `/` (carte) - Quartiers avec prix
- ✅ `/admin/commandes` - Commandes
- ✅ `/admin/categories` - Catégories
- ⏳ Autres pages - Connexion en cours

---

## 🎯 Prochaines Étapes (Optionnel)

- [ ] Finaliser connexion toutes pages aux vraies données
- [ ] Intégration OAuth (Google, Facebook)
- [ ] Système de paiement PayPal
- [ ] Upload d'images pour les annonces
- [ ] Tests E2E
- [ ] Optimisations SEO
- [ ] Mode sombre

---

## 📞 Contact & Support

- **Email :** contact@toubabi.com
- **Téléphone :** +225 05 85 32 50 50
- **Site :** http://www.toubabi.com

---

## 📄 Licence

Ce projet est sous licence privée - © 2024 Toubabi

---

**Développé avec ❤️ en Côte d'Ivoire**

*Réplique React/Next.js du projet PHP Laravel original*
