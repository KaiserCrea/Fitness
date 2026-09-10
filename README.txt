FITNESS — VERSION ULTIME V5
Mise à jour : 10 septembre 2026

IMPORTANT — DEPLOIEMENT GITHUB
==============================
Le dossier fiches/ déjà présent sur GitHub contient la bibliothèque réelle des fiches techniques.
IL NE DOIT PAS ETRE SUPPRIME, RECONSTRUIT OU REIMPORTE.

Pour installer cette version :
1. Conserver le dossier fiches/ existant à la racine du dépôt KaiserCrea/Fitness.
2. Remplacer les autres fichiers racine par ceux de ce ZIP.
3. Importer également le dossier assets/ fourni dans ce ZIP.
4. Attendre la fin du déploiement GitHub Pages.
5. Sur Android, ouvrir/relancer la PWA installée. Le cache V5 est différent de la V4.

CONTENU DE CETTE VERSION
========================
- Interface reconstruite à partir des maquettes finales noir / anthracite / blanc / doré.
- Aucun code vert ou rouge dans les statuts ou la progression.
- Aucun slogan décoratif ou motivationnel.
- 4 onglets principaux : Aujourd'hui / Programme / Progression / Historique.
- En-têtes, cartes, proportions, bordures, navigation et densité rapprochés des maquettes.
- Visuels d'ambiance dédiés pour G1/G2/G3, ATH et Full Mix.
- Miniatures des exercices recadrées à partir des vraies fiches techniques.
- Aujourd'hui affiche directement la prochaine séance G : aucun chronomètre et aucun démarrage automatique.
- Heure de début et heure de fin saisies manuellement par l'utilisateur.
- Durée calculée uniquement à partir des deux horaires saisis.
- Réussi : demande la prochaine référence ; Échoué : conserve la référence ; Non réalisé : aucune performance.
- Programme > Exercices classé par groupes musculaires, sans numéro permanent d'exercice.
- Exercices canoniques : une seule identité, mêmes paramètres, même progression et même historique lorsqu'ils sont réutilisés.
- Programme éditable : réorganisation, transfert, ajout, retrait et archivage sans perdre l'identité.
- Fiches techniques ouvertes directement depuis les exercices ; paramètres dynamiques intégrés sous la fiche.
- Pile de navigation navigateur/PWA compatible avec le bouton Retour Android.
- Rotations indépendantes ATH A/B et FM1/FM2/FM3/FM4.
- Sauvegarde JSON, restauration JSON et export CSV.
- Service worker V5 avec nouvelle version de cache.

FICHIERS FOURNIS
================
README.txt
app.css
app.js
data.js
assets/
icon-192.png
icon-512.png
index.html
manifest.webmanifest
sw.js

DOSSIER A CONSERVER SUR GITHUB
==============================
fiches/

REMARQUE
========
Cette archive est volontairement ROOT ONLY : elle ne contient pas fiches/ afin d'empêcher son remplacement accidentel.
