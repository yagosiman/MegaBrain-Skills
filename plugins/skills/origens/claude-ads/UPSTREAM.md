# Origem: claude-ads

Espelho da parte de método do https://github.com/AgriciDaniel/claude-ads (licença MIT,
em `LICENSE`). Gerado por `scripts/espelhar-claude-ads.mjs`; não edite à mão.

- Versão: `v2.1.0`, commit `4a74a5a2237caf2bc81091108164fe20e178818c` (2026-10-16)
- Copiado como veio: `ads/SKILL.md` (vira `skills/claude-ads/SKILL.md`), a pasta
  `ads/references/` inteira e, de cada sub-skill, o `SKILL.md` (vira
  `skills/claude-ads/fluxos/<nome>.md`) e o resto da pasta (em `fluxos/<nome>/`):
  `ads-audit`, `ads-meta`, `ads-tiktok`, `ads-google`, `ads-plan`, `ads-budget`, `ads-math`, `ads-creative`, `ads-test`, `ads-monitor`, `ads-attribution`, `ads-server-side-tracking`.
- Alterado por nós, só no `SKILL.md` da condutora: o `name` (`claude-ads`; no original, `ads`),
  uma frase em português no fim da `description` (o gatilho) e o bloco "Neste plugin" logo
  depois do frontmatter.
- Nenhuma outra linha mudou.
- Ficaram de fora, de propósito: o motor em Python (`claude_ads_core`), `scripts/`, os
  agentes (`agents/`), o instalador e as sub-skills que escrevem na conta ou dependem do
  motor (create, generate, photoshoot, launch, optimize, report, setup, validate, research,
  dna, landing, competitor) e as das outras plataformas.
- Por que as sub-skills não são skill solta: cada skill ocupa espaço na lista de skills de
  quem instala, e a lista tem orçamento. Quem chega nelas é a `claude-ads` e a
  `gestor-de-trafego`.
