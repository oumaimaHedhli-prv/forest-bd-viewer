# Documentation d'Implémentation - Frontend

## Aperçu
Le frontend est construit avec **Next.js** pour sa capacité à gérer le rendu côté serveur (SSR) et côté client (CSR), ce qui améliore les performances et le SEO. Il utilise également **TypeScript** pour une meilleure sécurité des types et une maintenance facilitée.

## Structure
- **src/app/** : Contient les fichiers principaux pour la configuration de l'application, comme `layout.tsx` et `globals.css`.
- **src/components/** : Contient des composants réutilisables comme `AuthModal` et `ForestMap`.
- **src/graphql/** : Définit les requêtes GraphQL pour interagir avec le backend.
- **src/lib/** : Contient le client Apollo pour gérer les requêtes GraphQL.
- **src/services/** : Fournit des services pour interagir avec des API externes comme IGN.
- **src/utils/** : Contient des utilitaires pour des tâches spécifiques.

## Choix Techniques
- **Next.js** : Permet un rendu hybride (SSR/CSR) et une gestion facile des routes.
- **Apollo Client** : Simplifie la gestion des requêtes GraphQL et le cache côté client.
- **TailwindCSS** : Utilisé pour un style rapide et cohérent.
- **TypeScript** : Améliore la qualité du code et réduit les erreurs.
- **Playwright** : Utilisé pour les tests end-to-end.

## Justification des Choix
- **Next.js** : Idéal pour les applications nécessitant un SEO performant.
- **Apollo Client** : Intégration facile avec GraphQL et gestion efficace du cache.
- **TailwindCSS** : Réduit le temps de développement des styles.
- **TypeScript** : Facilite la collaboration et la maintenance à long terme.

## Points d'Amélioration
- Ajouter des tests unitaires pour les composants.
- Optimiser les requêtes GraphQL pour réduire la surcharge réseau.