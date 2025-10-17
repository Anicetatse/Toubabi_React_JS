# 🔐 Authentification, Rôles et Permissions - Toubabi

## 📊 Structure de la Base de Données

### 1. Table `users` (Admins Backpack)
```sql
users {
  id: BigInt (PK)
  name: String
  email: String (unique)
  email_verified_at: DateTime?
  password: String
  remember_token: String?
  created_at: DateTime?
  updated_at: DateTime?
}
```

**Usage :** 
- Table pour les administrateurs Backpack Laravel
- Pas de système de rôles/permissions intégré
- Utilisée pour le backend Laravel uniquement

---

### 2. Table `clients` (Utilisateurs Frontend)
```sql
clients {
  id: BigInt (PK)
  nom: String
  prenom: String
  email: String (unique)
  password: String
  image: String?
  remember_token: String?
  telephone: String?
  type_compte: String (default: "particulier") ⭐
  facebook_id: String?
  google_id: String?
  enabled: Boolean (default: true) ⭐
  deleted_at: DateTime?
  created_at: DateTime?
  updated_at: DateTime?
}
```

**Usage :**
- Table pour tous les utilisateurs frontend (clients, partenaires, etc.)
- Le champ `type_compte` sert de **système de rôles simplifié**
- Le champ `enabled` permet d'activer/désactiver un compte

---

## 🎭 Système de Rôles

### Rôles disponibles via `type_compte` :

1. **"particulier"** (par défaut)
   - Utilisateur standard
   - Peut consulter les biens
   - Peut ajouter des biens en favoris
   - Peut passer des commandes

2. **"partenaire"** 
   - Professionnel de l'immobilier
   - Peut déposer des annonces
   - Accès à un espace professionnel

3. **"agence"**
   - Agence immobilière
   - Fonctionnalités étendues pour la gestion de biens

4. **"admin"** (potentiel)
   - Accès au dashboard admin
   - Gestion complète de la plateforme

---

## 🔒 Système d'Authentification Actuel

### Frontend (Next.js + React)

**Fichiers clés :**
- `/src/lib/auth-utils.ts` - Fonctions JWT et bcrypt
- `/src/app/api/auth/` - Routes API d'authentification
- `/src/services/authService.ts` - Service d'authentification

**Fonctionnalités :**
- Login via email/password
- Login social (Facebook, Google)
- JWT pour la gestion des sessions
- Tokens stockés dans localStorage
- Protection des routes via middleware

**JWT Payload Structure :**
```typescript
interface JWTPayload {
  userId: string;
  email: string;
}
```

---

## 🛡️ Recommandations de Sécurité

### ⚠️ Points à améliorer :

1. **Ajouter un champ `role` dans le JWT payload**
   ```typescript
   interface JWTPayload {
     userId: string;
     email: string;
     role: string;  // Nouveau
     type_compte: string;  // Nouveau
   }
   ```

2. **Créer un middleware de vérification des rôles**
   ```typescript
   // Exemple
   export function requireRole(allowedRoles: string[]) {
     // Vérifier le rôle dans le JWT
   }
   ```

3. **Séparer les admins des clients**
   - Option A : Ajouter `role` dans table `clients`
   - Option B : Utiliser table `users` pour admins seulement
   - **Recommandation actuelle** : Utiliser `type_compte === 'admin'` dans `clients`

4. **Implémenter un système de permissions granulaires** (optionnel)
   - Créer une table `permissions`
   - Créer une table `role_permissions`
   - Utiliser un package comme Spatie Laravel Permission

---

## 🎯 Implémentation Actuelle

### Routes Protégées

**Routes Admin (à protéger) :**
- `/admin/*` - Dashboard et gestion
- API `/api/admin/*` - APIs d'administration

**Routes Client (protégées) :**
- `/mon-espace/*` - Espace personnel
- `/deposer-annonce` - Dépôt d'annonce
- API `/api/client/*` - APIs client

### Vérification d'Authentification

**Dans les APIs :**
```typescript
const token = request.headers.get('authorization')?.replace('Bearer ', '');
const decoded = verifyToken(token);
if (!decoded) {
  return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
}
```

**Vérification du rôle (à implémenter) :**
```typescript
const client = await prisma.clients.findUnique({
  where: { id: BigInt(decoded.userId) },
  select: { type_compte: true, enabled: true }
});

if (!client.enabled) {
  return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
}

if (!['admin', 'partenaire'].includes(client.type_compte)) {
  return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
}
```

---

## 📝 TODO : Améliorations futures

- [ ] Ajouter `role` dans JWT payload
- [ ] Créer middleware de vérification des rôles
- [ ] Implémenter refresh tokens
- [ ] Ajouter 2FA (Two-Factor Authentication)
- [ ] Créer logs d'authentification
- [ ] Implémenter rate limiting
- [ ] Ajouter système de permissions granulaires

---

## 🔑 Variables d'Environnement

```env
JWT_SECRET=votre-secret-super-securise-changez-moi
DATABASE_URL=mysql://user:password@localhost:3306/toubabi
```

**⚠️ Important :** Changez le JWT_SECRET en production !

---

## 📚 Ressources

- [JWT.io](https://jwt.io/) - Debugger JWT
- [Bcrypt](https://www.npmjs.com/package/bcryptjs) - Hashing des mots de passe
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Prisma Documentation](https://www.prisma.io/docs)

---

*Dernière mise à jour : Octobre 2025*

