FITNESS — VERSION ULTIME V8 FINAL
Mise à jour : 11 septembre 2026

IMPORTANT — DEPLOIEMENT GITHUB
==============================
Le dossier fiches/ déjà présent sur GitHub reste la bibliothèque source.
NE PAS LE SUPPRIMER, NE PAS LE RECONSTRUIRE, NE PAS LE REIMPORTER.

Installation :
1. Conserver fiches/ à la racine de KaiserCrea/Fitness.
2. Remplacer les autres fichiers racine par ceux de ce ZIP.
3. Remplacer le dossier assets/ par celui fourni.
4. Attendre le déploiement GitHub Pages.
5. Relancer la PWA Android. Le service worker V8 utilise un nouveau cache.

REFERENCES VISUELLES VALIDÉES
============================
- Les deux maquettes validées « Aujourd’hui » et « Programme » sont les références officielles.
- Palette noir / anthracite / blanc / doré clair.
- Personnage de référence : homme très musclé, cheveux brun clair assez longs plaqués vers l’arrière, barbe soignée légèrement plus longue, débardeur noir col V sans inscription, aura dorée.
- Aujourd’hui : fond plus lumineux, personnage moins zoomé, davantage de haut du corps visible.
- Programme : même personnage, davantage vu de dos / trois-quarts dos, cartes plus lumineuses et mieux cadrées.
- Cartes et rectangles agrandis globalement quand nécessaire.
- Numéros 01/02/03… réduits et repositionnés pour un rendu plus premium.

AUJOURD'HUI
============
- Aucun chronomètre automatique.
- Heure de début et heure de fin saisies manuellement.
- Durée calculée à partir des horaires saisis.
- Annuler la séance supprime réellement la séance provisoire du jour.
- Une annulation ne modifie ni cycle, ni historique, ni progression.
- Après annulation, la même séance reste la prochaine séance prévue et peut être rouverte.

PROGRAMME
=========
- Onglets : Séances / Exercices / Groupes / Gestion.
- Bibliothèque classée par groupes musculaires.
- Variantes A/B/C, ATH A/B, FM1-4 : aucune surbrillance automatique.
- Appui maintenu + glissement = prévisualisation dorée temporaire ; sélection au relâchement seulement.
- Cartes G1/G2/G3/ATH/FULL MIX agrandies et recadrées comme les maquettes.
- Réorganisation, transfert, ajout, retrait et archivage conservent l’identité/historique de l’exercice.

FICHES TECHNIQUES
==================
- Suppression du bloc de sélection Séance / Exercice ajouté au-dessus de la fiche.
- Affichage de la fiche recadré pour retirer le bandeau G1A imprimé devenu inutile.
- Affichage recadré pour retirer la bande fixe Charge / Séries / Répétitions / Repos et la zone Notes personnelles.
- Les fichiers originaux dans fiches/ ne sont pas modifiés.
- Les paramètres dynamiques de l’exercice restent sous la fiche.

MINIATURES
==========
- Source unique : vraies fiches techniques.
- Recadrage prioritaire sur la position CONTRACTION.
- Cadrage plus bas pour garder tête + buste + mouvement sans coupes gênantes.
- Traitement commun sombre/premium/doré sur toutes les miniatures.
- Même miniature et même traitement pour un même exercice partout dans l’application.

NAVIGATION
==========
- 4 onglets : Aujourd’hui / Programme / Progression / Historique.
- Navigation par boutons du bas + swipe gauche/droite.
- Le swipe est désactivé sur les composants qui ont leur propre geste horizontal.
- Chaque onglet mémorise sa propre position de défilement.
- Un nouvel onglet s’ouvre à sa propre position (0 lors de la première ouverture), pas à la hauteur de l’onglet précédent.
- Retour Android conserve la pile de navigation interne.

MISE EN PAGE
============
- Suppression des espaces morts et scrolls artificiels.
- Les pages courtes n’ajoutent pas de vide inutile.
- Les modales sont plus grandes, plus hautes et mieux centrées.
- Recadrage global de l’interface à chaque endroit où nécessaire.

ARCHIVE ROOT ONLY
=================
Cette archive ne contient volontairement aucun dossier fiches/.
