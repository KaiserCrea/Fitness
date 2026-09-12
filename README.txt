FITNESS — VERSION ULTIME V9 FINAL
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
5. Relancer la PWA Android. Le service worker V9 utilise un nouveau cache.

REFERENCES VISUELLES VALIDÉES
============================
- Les deux maquettes validées « Aujourd’hui » et « Programme » sont les références officielles.
- Palette noir / anthracite / blanc / doré clair.
- Personnage de référence : homme très musclé, cheveux brun clair assez longs plaqués vers l’arrière, barbe soignée légèrement plus longue, débardeur noir col V sans inscription, aura dorée.
- Aujourd’hui : fond plus lumineux, personnage moins zoomé, davantage de haut du corps visible.
- Programme : même personnage, davantage vu de dos / trois-quarts dos, cartes plus lumineuses et mieux cadrées.
- Les assets hero-today / hero-program et les cartes G1/G2/G3/ATH/FULL MIX ont été reconstruits à partir des deux modèles visuels validés, avec fond salle sombre et aura dorée commune.
- Les visuels officiels PNG validés le 12 septembre 2026 sont maintenant utilisés directement pour hero-program et les cartes G1/G2/G3/ATH/FULL MIX. Le service worker les précharge et force un nouveau cache.
- Le bandeau officiel Aujourd'hui avec le personnage réalisant un curl simultané aux haltères est également intégré et préchargé hors ligne.
- Le bandeau officiel Progression avec le personnage réalisant un curl à la barre EZ est intégré et préchargé hors ligne.
- Le bandeau officiel Historique avec le personnage assis après l'effort et tenant deux haltères est intégré et préchargé hors ligne.
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
- Après annulation, on reste dans l’onglet Aujourd’hui : aucun basculement automatique vers Programme.

PROGRAMME
=========
- Onglets : Séances / Groupes / Paramètres.
- Chaque groupe ouvre une page dédiée contenant uniquement ses propres exercices.
- Variantes A/B/C, ATH A/B, FM1-4 : aucune surbrillance automatique.
- Appui maintenu + glissement = prévisualisation dorée temporaire ; sélection au relâchement seulement.
- Cartes G1/G2/G3/ATH/FULL MIX agrandies et recadrées comme les maquettes.
- L’écran Séances est verrouillé à la hauteur utile : pas de grand espace noir que l’on peut faire défiler sous le contenu.
- Réorganisation, transfert, ajout, retrait et archivage conservent l’identité/historique de l’exercice.

FICHES TECHNIQUES
==================
- Suppression du grand en-tête Fiche technique / nom de l'exercice ; bouton Fermer discret conservé.
- Chaque image est analysée lors de son chargement pour repérer sa zone inférieure Notes personnelles / Résultat.
- Les informations techniques utiles restent visibles et le panneau des paramètres dynamiques remplace cette seule zone inférieure.
- Les fichiers originaux dans fiches/ ne sont pas modifiés.

MINIATURES
==========
- Source unique : vraies fiches techniques.
- Recadrage prioritaire sur la position CONTRACTION.
- Recadrage direct sur le tiers CONTRACTION de la fiche pour éviter jambes seules, schéma Mouvement et coupes arbitraires.
- Cadrage conçu pour garder tête + buste + mouvement sans coupes gênantes.
- Traitement commun sombre/premium/doré sur toutes les miniatures.
- Même miniature et même traitement pour un même exercice partout dans l’application.

NAVIGATION
==========
- 4 onglets : Aujourd’hui / Programme / Progression / Historique.
- Navigation par boutons du bas + swipe gauche/droite.
- Le swipe est désactivé sur les composants qui ont leur propre geste horizontal.
- Chaque onglet mémorise sa propre position de défilement.
- L’onglet actif est mémorisé : actualiser Programme / Progression / Historique ne renvoie plus vers Aujourd’hui.
- Sur Android, l'ouverture d'une variante de séance est différée de quelques millisecondes afin d'absorber le clic tactile synthétique : la séance s'affiche directement et sa première fiche technique ne s'ouvre plus automatiquement.
- Mise à jour groupée de l'ergonomie : Programme réduit à Séances / Groupes / Paramètres, suppression des Outils redondants, filtrage strict des groupes, titres multilignes, miniatures agrandies, numéros intégrés aux noms, saisie directe des horaires, kilogrammes automatiques, fond d'attente premium Aujourd'hui et cadrage adaptatif des fiches techniques.
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
