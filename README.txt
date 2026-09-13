FITNESS V20 — INSTALLATION
Décompressez Fitness_APP_V20_VISUELS_ACCUEIL_ROOT_ONLY.zip.
Dans votre dépôt GitHub Fitness, téléversez tout le contenu décompressé à la racine : fichiers et dossier assets. Remplacez les fichiers existants.
Ne créez pas de dossier app_v9 dans le dépôt. Conservez le dossier fiches existant.
Attendez la fin du déploiement GitHub Pages, puis fermez et rouvrez l’application connectée à Internet.
Ne supprimez pas les données utilisateur.

MISE À JOUR V20 — 13 SEPTEMBRE 2026
Base : V19, avec les fonctions Progression et Historique conservées.
- Programme : onglets sous le bandeau, hauteur 228 px conservée.
- G1/G2 : ombres renforcées et lumière harmonisée par CSS, images sources conservées.
- Progression et Historique : nouveaux visuels approuvés, sans texte intégré, hauteur 228 px.
- Aujourd’hui sans séance ouverte : salle plein écran avec personnage de dos, badge Cycle G en bas à gauche sous le banc.
- Aujourd’hui séance ouverte : nouveau bandeau, code de séance dynamique et muscles conservés, badge en bas à droite.
- L’ouverture d’une séance est explicite ; une séance en cours est conservée au rechargement. Annuler revient à l’accueil.
- Cache V20 incluant les quatre nouveaux visuels. Aucun changement des clés de données ou de leur schéma.
Vérifications : syntaxe JS, exécution des rendus avec DOM simulé (accueil, annulation, G2A, ATH, Programme, trois vues Progression, Historique), existence des ressources précachées.
Limite : rendu visuel non vérifié dans un navigateur mobile réel.
