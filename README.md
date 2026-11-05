# TruckElsass V3.0

Base : V2.4.1 transmise par l’utilisateur.

## Nouveautés
- Design peaufiné avec boutons confortables, couleurs alsaciennes et cartes homogènes.
- Chronomètre de service facultatif : début/fin, sans sauvegarde silencieuse d’une journée.
- Congés et absences stockés séparément.
- Prévisualisation indicative de la plage de nuit personnalisable, **avant déduction des pauses**, sans prime automatique.
- Impression / export PDF via la feuille d’impression iOS.
- Cache versionné et navigation réseau prioritaire pour les pages.

## Données
La clé `truckmate.v1` est conservée. Les journées et profils existants sont repris. Les absences et la plage de nuit sont des champs supplémentaires optionnels, inclus dans les exports JSON.

## Installation
Sauvegarder les données via Réglages avant mise à jour. Décompresser puis envoyer les neuf fichiers à la racine du dépôt GitHub Pages. Ne pas désinstaller l’ancienne application avant vérification.

## Important
Simulation de paie indicative. Les heures de nuit visualisées ne sont pas nécessairement éligibles à une majoration. Le chronomètre n’enregistre pas automatiquement de pause. Vérifier manuellement toute journée de plus de 24 heures.


## Version 3.0.1 — correctifs d’affichage
- Mise en page adaptative iPhone et Android (date/heure, journal, réglages, import JSON, navigation).
- Zones tactiles de navigation conservées légèrement agrandies.
- Numéro de version des ressources et du service worker actualisé pour le rafraîchissement.
- Aucun changement des clés de stockage, des calculs ou de la logique métier.

**Important :** exporter une sauvegarde JSON avant la mise à jour. Ne pas désinstaller l'application pour actualiser son interface. Tester l'affichage sur appareils réels.
