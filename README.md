# TruckMate — PWA V1

Application statique (HTML/CSS/JavaScript), sans dépendance ni serveur applicatif.

## Démarrage

Dans ce dossier : `python3 -m http.server 8000` puis ouvrir http://localhost:8000 sur ordinateur.

Pour l'installer sur iPhone/Android et activer le service worker hors ligne, déployer ce dossier sur un hébergement HTTPS (GitHub Pages, Netlify, Cloudflare Pages, etc.). Sur iPhone : Safari > Partager > Sur l'écran d'accueil. Sur Android : menu navigateur > Installer l'application / Ajouter à l'écran d'accueil.

## Fonctionnalités

- Journal de travail avec horaires 24h, contrôle de cohérence et modification/suppression
- Tableau de bord de la semaine courante (lundi–dimanche)
- Estimation brute et primes configurables, profils distincts France/Allemagne
- Stockage localStorage et export/import JSON
- Manifest PWA, icônes et cache hors ligne (HTTPS)

## Limites importantes

- Pas de synchronisation, compte, cloud, ni stockage serveur
- Les paramètres ne sont PAS des règles légales vérifiées
- Le seuil hebdomadaire et les majorations sont une simple simulation, sans modulation, compensation, décompte réglementaire, accords, fiscalité, ni charges
- Nuit : durée éligible saisie manuellement, pas de détection automatique à partir des heures de service
- Attente : qualification simplifiée, sans statut légal automatique
- Repas : une indemnité par journée enregistrée, indépendamment des conditions réelles d'éligibilité
- La durée de service utilise le modulo 24h : les journées de 24h exactes ne sont pas prises en charge
- Pour une vraie commercialisation : authentification, base de données, sauvegardes, tests, sécurité, conformité RGPD et moteur réglementaire validé
