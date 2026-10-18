# Journal de Suivi — Passe 11

| ID | État | Commit | Test | Fichiers |
| :---: | :---: | :---: | :---: | :--- |
| **A1** | **FAIT** | `e6c22d7` | `audit11/scripts/build-and-verify-sets.ts` | `audit11/A1_jeux.md`, `audit11/jeu_dev.csv`, `audit11/jeu_reserve.csv` |
| **A2** | **FAIT** | `ff497c6` | `audit11/scripts/evaluate-a2-reference.ts` | `audit11/A2_reference.md`, `audit11/raw/A2_reference.json` (Jeu RÉSERVÉ CONSOMMÉ) |
| **A3** | **FAIT** | `5b9dc03` | `tests/iris/dev-safety-layer1.test.ts` | `audit11/A3_motifs.md`, `src/lib/iris/safety-config.json` |
| **A4** | **FAIT** | `93e6fd9`, `b4bfaf1` | `audit11/scripts/evaluate-a4-final.ts` | `audit11/A4_final.md`, `audit11/jeu_final.csv`, `audit11/raw/A4_final.json` (Jeu FINAL CONSOMMÉ) |
| **A5** | **FAIT** | `3913aa4` | `audit11/scripts/analyze-a5.ts` | `audit11/A5_couche1.md` |
| **B1** | **FAIT** | `ab08eda` | `audit11/scripts/benchmark-b2.ts` | `audit11/B1_protocole.md` |
| **B2** | **FAIT** | `ab08eda` | `audit11/scripts/benchmark-b2.ts` | `audit11/B2_latence.md`, `audit11/raw/B2_latence.json` |
| **B3** | **FAIT** | `ab08eda` | `node -e` vérification env | `audit11/B3_ttft.md` (NON TESTABLE ICI : pas de clé réelle) |
| **B4** | **FAIT** | `ab08eda` | `audit11/scripts/reproduce-b4.ts` | `audit11/B4_contradiction.md`, `audit11/raw/B4_reproduction.json` |
| **C1** | **FAIT** | `c5ff0c5` | `audit11/scripts/diff-expected-status.ts` | `audit11/C1_attentes.md`, `audit11/raw/C1_changed_cells.json` |
| **C2** | **FAIT** | `c5ff0c5` | `audit11/scripts/inspect-self-reads.ts` | `audit11/C2_selfreads.md`, `audit11/QUESTIONS_AUTEUR.md` (Q1) |
| **C3** | **FAIT** | `c5ff0c5` | `audit11/scripts/test-superadmin-individual.ts` | `audit11/C3_superadmin.md`, `audit11/QUESTIONS_AUTEUR.md` (Q2) |
| **C4** | **FAIT** | `c5ff0c5` | `validation/t4-authz/run.ts` | `audit11/C4_matrice.md`, `validation/t4-authz/result.json` |
| **D1** | **FAIT** | `4b06c69` | `audit11/D1_invitations.md` | `audit11/D1_invitations.md` (Constat sans DECISIONS_AUTEUR.md) |
| **D2** | **FAIT** | `4b06c69` | `audit11/D2_leads.md` | `audit11/D2_leads.md` (Constat sans DECISIONS_AUTEUR.md) |
| **D3** | **FAIT** | `4b06c69` | `audit11/D3_organisation.md` | `audit11/D3_organisation.md` (Constat uniquement) |
| **D4** | **FAIT** | `4b06c69` | `audit11/scripts/analyze-t10-witnesses.ts` | `audit11/D4_effacement.md`, `audit11/raw/D4_witnesses.json` |
