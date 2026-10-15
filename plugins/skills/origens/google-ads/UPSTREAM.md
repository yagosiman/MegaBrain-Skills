# Origem: Google Ads

Espelho de três skills do repositório https://github.com/google/skills, do time da API
do Google Ads (licença Apache-2.0, em `LICENSE`). Gerado por
`scripts/espelhar-google-ads.mjs`; não edite à mão.

- Commit: `3f3707f8e4c99ef04c058f327e0ac1632a0c5a34` (2026-10-15)
- Copiado: as pastas `skills/ads/google-ads-api-account-diagnostics`, `skills/ads/google-ads-api-mcp-setup`, `skills/ads/google-ads-api-quickstart` como vieram.
- Alterado por nós, em cada `SKILL.md`: uma frase em português no fim da `description`
  (o gatilho) e o bloco "Neste plugin" logo depois do frontmatter.
- Consertado: aspas em valor que no original quebrava o YAML do frontmatter, e com ele a
  skill carregava sem `description` e nunca ligava sozinha. Neste commit: google-ads-api-account-diagnostics (compatibility).
- Nenhuma outra linha mudou.
- O servidor MCP do Google Ads (https://github.com/googleads/google-ads-mcp) não é
  copiado nem ligado pelo plugin: ele usa a credencial de cada pessoa, que liga o seu
  com a skill `google-ads-api-mcp-setup`.
