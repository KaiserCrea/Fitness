FITNESS — VERSION ULTIME V7 FINAL
Mise à jour : 11 septembre 2026

IMPORTANT — DEPLOIEMENT GITHUB
==============================
Le dossier fiches/ déjà présent sur GitHub contient la bibliothèque réelle des fiches techniques.
IL NE DOIT PAS ETRE SUPPRIME, RECONSTRUIT OU REIMPORTE.

Pour installer cette version :
1. Conserver impérativement le dossier fiches/ existant à la racine de KaiserCrea/Fitness.
2. Remplacer les autres fichiers racine par ceux de ce ZIP.
3. Remplacer aussi le dossier assets/ par celui fourni dans ce ZIP.
4. Attendre la fin du déploiement GitHub Pages.
5. Relancer la PWA Android. Le service worker V7 utilise un nouveau cache.

DESIGN FINAL
============
- Maquettes utilisées comme référence visuelle principale et non comme simple inspiration.
- Palette : noir / anthracite / blanc / doré uniquement.
- Doré éclairci et plus lumineux.
- Aucun vert ni rouge pour Réussi / Échoué / progression / historique.
- Aucun slogan décoratif ou motivationnel ajouté dans l'application.
- Personnage visuel unifié : homme très musclé, cheveux brun clair plus longs plaqués vers l'arrière, barbe soignée légèrement plus longue, débardeur noir sans inscription.
- Aura dorée douce autour de toutes les représentations de personnages.
- Personnage davantage visible dans les cadrages ; vues variées selon l'écran (face/3-4, dos, profil, athlétique).
- Nouveaux visuels dédiés Aujourd'hui / Programme / Progression / Historique et G1 / G2 / G3 / ATH / Full Mix.
- Rectangles, cartes, champs, boutons, modales et listes agrandis globalement pour une meilleure lisibilité.
- Recadrage et équilibre de l'interface revus globalement.
- Suppression des espaces morts et des scrolls artificiels, notamment sur Programme > Séances.

AUJOURD'HUI
============
- Aucun chronomètre automatique.
- Heure de début saisie manuellement.
- Heure de fin saisie manuellement.
- Durée calculée uniquement à partir des deux horaires saisis.
- Cartes d'exercices agrandies afin de retrouver la densité des maquettes.
- Réussi : demande la prochaine charge/référence.
- Échoué : conserve la référence actuelle.
- Non réalisé : ne crée aucune performance.
- Bouton Annuler la séance accessible dans l'en-tête.
- Une séance annulée ne modifie ni le cycle, ni l'historique, ni les statistiques.
- Confirmation d'annulation lorsque des informations ont déjà été saisies.

PROGRAMME
=========
- Onglets : Séances / Exercices / Groupes / Gestion.
- Exercices classés par groupes musculaires dans la bibliothèque.
- Aucun A/B/C, ATH A/B ou FM1/2/3/4 n'est mis en surbrillance automatiquement dans Programme.
- Interaction tactile des variantes : appui maintenu + glissement = surbrillance temporaire ; sélection uniquement au relâchement sur un bouton.
- Un relâchement hors d'un bouton n'effectue aucune sélection.
- Appui simple sur une variante = ouverture de cette séance.
- Réorganisation des exercices par glisser-déposer en mode Modifier.
- Transfert, ajout, retrait et archivage sans perdre l'identité, les paramètres ou l'historique de l'exercice.

FICHES TECHNIQUES ET MINIATURES
===============================
- Les vraies fiches du dossier fiches/ restent la source unique.
- Miniatures issues des vraies fiches avec recadrage prioritaire sur la position CONTRACTION.
- Même logique de miniature dans Aujourd'hui, Programme, listes de séance et Progression.
- Une même fiche reste attachée à l'identité de l'exercice, même après réorganisation ou transfert.
- Le bandeau Séance / Exercice a été déplacé au-dessus de la fiche pour ne plus masquer son contenu.
- Numéro d'exercice dynamique selon la séance sélectionnée.
- La zone imprimée « Notes personnelles » est masquée dans l'affichage de l'application sans modifier les fichiers du dossier fiches/.
- Paramètres de l'exercice intégrés immédiatement sous la fiche, dans la continuité visuelle de celle-ci.

PROGRESSION / HISTORIQUE
========================
- Cartes et lignes agrandies.
- Personnages et fonds mieux cadrés.
- Graphiques et tendances dans la palette noir / blanc / doré.
- Répartition musculaire convertie en nuances dorées / grises uniquement.
- Sous-pages dimensionnées pour éviter les grands espaces vides artificiels.

NAVIGATION ANDROID / PWA
========================
- 4 onglets principaux : Aujourd'hui / Programme / Progression / Historique.
- Pile de navigation interne conservée pour le bouton Retour Android.
- Une fiche revient à son écran parent ; un détail de séance revient à Programme ; l'application ne doit pas se fermer tant qu'un écran interne peut être quitté.
- Rotations indépendantes ATH A/B et Full Mix 1/2/3/4.
- Sauvegarde locale existante conservée via la même clé localStorage.
- Sauvegarde JSON, restauration JSON et export CSV conservés.

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
