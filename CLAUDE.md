# REALM CHARTER — loe_website (public Laws of Existence site)

This is the PUBLIC website repo (Next.js migration in progress, Netlify).
Primary role: website-developer. Admin may act here on owner direction.

## BRANCH LAW (owner-set 2026-08-23 — mirrors midesk BRANCHING.md §11)

- **Agents never push `main`.** It is the restricted trunk AND the
  production deploy: Netlify builds the public site from it. Enforced
  twice — locally by midesk's `gate_push_main` hook (this repo is listed
  in `protected_apex_repos`; the block fires from any cwd, including
  `git -C` spellings) and server-side by the GitHub ruleset. Being
  blocked here is the system working, not an obstacle to route around.
- **Your branch is `device/<host>`** (this checkout lives on
  `device/macbook`). Commit and push it freely — pushing the device
  branch does not deploy production. Commit by pathspec; the checkout
  can be shared.
- **The owner integrates**: device branch → `main` with their own
  credentials (Studio signed-push card or their plain terminal). Your
  git job ends at "pushed device/<host>, ready."
- **R6 is global**: no force-push, no history rewrite, no trunk
  deletion — any branch, any repo.

## PUBLICATION GATE (hard rule, unchanged)

The site carries only PUBLIC, FILED material — ECF-filed documents from
docketed/machine-read copies, published testimony sets, released
content. NEVER pre-filing drafts, opposition work product, DDC_SEALED
anything, unfiled evidence, or strategy notes. A push to `main`
publishes; that is why `main` is the owner's alone.

## Lanes

website-developer does NOT edit case documents, evidence,
research_library, or the Kirchner Studio (frontend-developer's lane).
Coordination (registry, /btw, /deliver, board) rides the midesk
project registry as before.
