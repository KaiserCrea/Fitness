FITNESS V21 — INSTALLATION
Décompressez Fitness_APP_V21_VISUELS_ACCUEIL_ROOT_ONLY.zip.
Dans votre dépôt GitHub Fitness, téléversez tout le contenu décompressé à la racine : fichiers et dossier assets. Remplacez les fichiers existants.
Ne créez pas de dossier app_v9 dans le dépôt. Conservez le dossier fiches existant.
Attendez la fin du déploiement GitHub Pages, puis fermez et rouvrez l’application connectée à Internet.
Ne supprimez pas les données utilisateur.

MISE À JOUR V21 — 13 SEPTEMBRE 2026
Base : V19, avec les fonctions Progression et Historique conservées.
- Programme : onglets sous le bandeau, hauteur 228 px conservée.
- G1/G2 : ombres renforcées et lumière harmonisée par CSS, images sources conservées.
- Progression et Historique : nouveaux visuels approuvés, sans texte intégré, hauteur 228 px.
- Aujourd’hui sans séance ouverte : salle plein écran avec personnage de dos, badge Cycle G en bas à gauche sous le banc.
- Aujourd’hui séance ouverte : nouveau bandeau, code de séance dynamique et muscles conservés, badge en bas à droite.
- L’ouverture d’une séance est explicite ; une séance en cours est conservée au rechargement. Annuler revient à l’accueil.
- Cache V21 incluant les quatre nouveaux visuels. Aucun changement des clés de données ou de leur schéma.
Vérifications : syntaxe JS, exécution des rendus avec DOM simulé (accueil, annulation, G2A, ATH, Programme, trois vues Progression, Historique), existence des ressources précachées.
Limite : rendu visuel non vérifié dans un navigateur mobile réel.

V21 — Correction du chevauchement dans les détails des séances.
Anciennes grilles à cinq colonnes retirées. Miniature, nom complet avec numéro et chevron utilisent trois colonnes explicites.
Le mode Modifier remplace le chevron par les commandes de menu et de déplacement.
Correction commune à toutes les séances G et Full Mix. Menus et visuels V20 conservés.
Vérifications : syntaxe JavaScript, structure des lignes et calcul des largeurs de grille aux formats mobiles. Pas de validation visuelle dans un navigateur réel.
MISE À JOUR V22
Copier tout le contenu de cette archive à la racine du dépôt GitHub Fitness en remplaçant les fichiers existants.
Conserver le dossier fiches déjà présent sur GitHub : il n'est pas inclus dans l'archive légère d'installation.
Attendre la fin du déploiement GitHub Pages, puis fermer et rouvrir l'application.
Ne pas effacer les données de l'application : cette mise à jour conserve l'historique et les réglages existants.
VERSION 23 — BOUQUET FINAL — 14/09/2026
- 118 miniatures officielles intégrées dans miniatures/ et associées par thumbnail-map.js.
- Filtres temporels, navigation, charges, statuts et écrans Programme/Progression/Historique finalisés.
- Nettoyage unique des données d’essai lors du premier lancement V23.
