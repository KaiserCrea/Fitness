FITNESS — VERSION DESIGN FINALE V4
Mise à jour : 10 septembre 2026
Dépôt : KaiserCrea/Fitness

OBJECTIF
Cette version correspond à la reconstruction de l’interface finale de l’application Fitness à partir des maquettes validées et du cahier des charges V3.

IMPORTANT — DOSSIER FICHES
Le dossier GitHub « fiches/ » contient la bibliothèque réelle des fiches techniques déjà classées et installées.
NE PAS supprimer, remplacer, reconstruire ni réimporter ce dossier.

MISE À JOUR DU DÉPÔT
À la racine du dépôt GitHub, conserver uniquement le dossier existant « fiches/ », puis remplacer les autres anciens fichiers par le contenu de ce package.

Le dépôt doit ensuite contenir notamment :
- assets/
- fiches/  ← dossier existant à conserver intact
- app.css
- app.js
- data.js
- icon-192.png
- icon-512.png
- index.html
- manifest.webmanifest
- README.txt
- sw.js

PRINCIPES DE LA VERSION V4
- PWA Android avec 4 onglets : Aujourd’hui / Programme / Progression / Historique.
- Interface noir / anthracite / blanc / doré uniquement.
- Aucun vert ni rouge dans les statuts ou indicateurs.
- Aucun slogan décoratif ou motivationnel.
- Navigation Android avec pile de retour interne.
- Ouverture directe des vraies fiches techniques depuis les exercices.
- Miniatures provenant des fiches réelles.
- Identité unique des exercices réutilisés dans plusieurs séances.
- Paramètres propres à chaque exercice intégrés à la partie basse de sa fiche.
- Programme éditable avec réorganisation, ajout, retrait et transfert d’exercices sans perte d’historique.
- Cycle principal G : A → B → C avec G1 → G2 → G3.
- Rotations complémentaires indépendantes : ATH A/B et FM1 → FM2 → FM3 → FM4.
- Statuts : Réussi / Échoué / Non réalisé.

DONNÉES LOCALES
La clé localStorage historique reste « fitness-reconstruit-v2 » afin de préserver les données locales existantes lors de la mise à jour.

SERVICE WORKER
Cache : « fitness-design-final-v4-20260910-3 ».

APRÈS MISE EN LIGNE SUR GITHUB PAGES
1. Attendre la fin du déploiement GitHub Pages.
2. Ouvrir l’application avec une connexion réseau afin que le nouveau service worker soit chargé.
3. Si une ancienne interface reste affichée, fermer complètement la PWA puis la rouvrir.
4. Vérifier Aujourd’hui, Programme, Progression et Historique.
5. Ouvrir plusieurs exercices afin de vérifier que leurs vraies fiches et miniatures sont bien utilisées.
6. Ne modifier le dossier « fiches/ » que si une association précise est réellement incorrecte.

STATUT
Cette V4 est une version de validation du design final. Elle ne doit être considérée comme finale qu’après validation du rendu réel sur Android, des associations de fiches, de la navigation et du fonctionnement complet.
