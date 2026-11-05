# TruckElsass V2.4

Mise à jour visuelle et fonctionnelle de la V2.3.

- Logo **Truck** blanc et **Elsass** rouge.
- Journées enregistrées dans « Ma semaine » regroupées en sections dépliables, avec édition au toucher.
- Journal quotidien : encadré, champs et résumé accentués en rouge.
- « Mon mois » : onglet Calendrier fonctionnel, affichage des jours, horaires calculés des journées saisies, toucher pour modifier une journée ou en ajouter une.
- Accueil : panneau mensuel et présentation harmonisée.
- Les paramètres, les calculs et la clé de stockage locale existants restent inchangés.

Avant la mise à jour : exporter une sauvegarde JSON depuis Réglages.
Décompresser et envoyer les 9 fichiers à la racine du dépôt GitHub Pages, puis Commit changes. Ne pas désinstaller l’application pour actualiser le site.

Les heures de nuit ne sont pas automatiquement déduites des horaires rapides ; elles nécessitent une saisie/qualification. Les montants de paie sont indicatifs.


## Correctif V2.4.1
Correction du plantage JavaScript causé par une référence à `monthTable`, élément supprimé lors de la refonte. Navigation, mois et calendrier restaurés. Données locales inchangées (`truckmate.v1`).
