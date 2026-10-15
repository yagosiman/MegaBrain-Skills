// =============================================================================
// espelhar-claude-ads.mjs — AgriciDaniel/claude-ads (GitHub) → plugins/skills
//
// O claude-ads (licença MIT) é um "gestor de mídia paga" pra 12 plataformas:
// uma skill condutora (`ads`), 33 sub-skills, 25 agentes e um motor em Python
// (`claude_ads_core`) que dá a nota da conta, valida o JSON e gera o relatório.
// Aqui entra só o método: a condutora, as referências dela e as sub-skills de
// Meta, TikTok e Google que não dependem de escrever na conta.
//
// O recorte, e por quê:
//   - A condutora vira a skill `claude-ads` (no original, `ads`): o nome `ads`
//     é o da skill de estratégia do marketingskills, que também está aqui.
//   - As sub-skills NÃO viram skill solta: ficam como arquivo em
//     `claude-ads/fluxos/<nome>.md`, com o texto como veio. Cada skill solta
//     ocupa espaço na lista de skills de quem instala, e a lista tem orçamento
//     (descrição que passa dele é cortada); 12 skills de anúncio iam empurrar
//     as outras pra fora. Quem chega por elas é a condutora e a
//     `gestor-de-trafego`, que leem o fluxo certo.
//   - Não vêm o motor em Python, os scripts, os agentes nem as sub-skills que
//     escrevem na conta (launch, optimize) ou geram arquivo pelo motor
//     (create, report, setup). O bloco "Neste plugin" diz isso pro Claude.
//
// Versão: a tag vX.Y.Z mais nova (o autor publica por tag). Uso:
//   node scripts/espelhar-claude-ads.mjs            # a tag mais nova
//   node scripts/espelhar-claude-ads.mjs v2.0.2     # uma tag ou commit exato
//
// O repositório baixado é dado, não código: só se copiam arquivos de texto;
// nada dele roda aqui.
// =============================================================================

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PE, baixar, comAspasOndeQuebra, comGatilho, comNome, conferirPedido, iguais, lerPasta, separar, tagMaisNova } from "./espelho-comum.mjs";

const REPO = "https://github.com/AgriciDaniel/claude-ads.git";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = path.join(RAIZ, "plugins", "skills");
const ORIGEM = path.join(PLUGIN, "origens", "claude-ads");
const NOME = "claude-ads";
const PARA = path.join(PLUGIN, "skills", NOME);

// As sub-skills que entram, como fluxo. Pôr ou tirar uma é mexer aqui (e na
// lista do bloco abaixo, que o Claude lê).
const FLUXOS = [
  "ads-audit",
  "ads-meta",
  "ads-tiktok",
  "ads-google",
  "ads-plan",
  "ads-budget",
  "ads-math",
  "ads-creative",
  "ads-test",
  "ads-monitor",
  "ads-attribution",
  "ads-server-side-tracking",
];

// Sem aspas, barra, ": " nem " #": entra no fim de uma `description` entre aspas.
const GATILHO =
  "Also use it when the person asks, even in Portuguese, for a full paid-media audit or plan across Meta, TikTok or Google " +
  "(auditoria de tráfego pago, plano de mídia, revisar as contas de anúncio, pixel e API de Conversões). " +
  "For day-to-day Portuguese requests about their own ads, start with the gestor-de-trafego skill, which reads this one.";

const BLOCO = [
  "> **Neste plugin.** Cópia do claude-ads (AgriciDaniel/claude-ads, licença MIT, em",
  "> `origens/claude-ads/`), só a parte de método. São nossos este bloco, a frase em",
  "> português no fim da `description` e o nome da skill (`claude-ads`; no original, `ads`);",
  "> o resto veio como está.",
  ">",
  "> **O que não veio.** O motor em Python (`claude_ads_core`), os scripts e os agentes",
  "> `audit-*`. Então:",
  "> - Sem nota de saúde (score). O texto manda usar o motor determinístico e proíbe calcular",
  ">   a nota no prompt: entregue observações, diagnósticos e ações, diga que a nota ficou de",
  ">   fora e não invente uma.",
  "> - Sem pacote JSON validado nem relatório HTML ou PDF. Escreva o resultado em texto (a",
  ">   skill `gestor-de-trafego` diz o formato), com as mesmas camadas que o texto pede.",
  "> - Onde o texto manda despachar um agente por plataforma, faça cada plataforma você",
  ">   mesmo, uma de cada vez, lendo o fluxo e a referência dela.",
  ">",
  "> **Onde está cada coisa.** As sub-skills que o texto cita estão em `fluxos/<nome>.md`",
  "> nesta pasta: " + FLUXOS.map((f) => `\`${f}\``).join(", ") + ".",
  "> Quando um fluxo diz `ads/references/...` ou \"the main `ads` contract\", é a pasta",
  "> `references/` e este arquivo. As outras sub-skills (create, generate, launch, optimize,",
  "> report, setup e as outras plataformas) não vieram: se o pedido cair nelas, diga isso.",
  ">",
  "> **Conta de anúncio só se lê.** Pelo conector oficial de cada plataforma, ligado pela",
  "> própria pessoa, ou pelo export que ela colar. O \"mutation gate\" do texto termina sempre",
  "> em rascunho: nada aqui muda verba, pausa, cria ou apaga campanha, quem aplica é gente.",
  "> Os comandos `/ads ...` do texto são pedidos em linguagem natural (ou `/skills:claude-ads`).",
  "> Responda na língua da pessoa.",
  ...PE,
];

const pedido = conferirPedido(process.argv[2] ?? tagMaisNova(REPO));

const antes = lerPasta(PARA);
const { tmp, commit, data } = baixar(REPO, pedido, ["/LICENSE", "/ads/SKILL.md", "/ads/references/", ...FLUXOS.map((f) => `/skills/${f}/`)]);
let consertadasNoTexto = [];
try {
  const original = separar(readFileSync(path.join(tmp, "ads", "SKILL.md"), "utf8"), "ads");
  const { texto: frontmatter, consertadas } = comAspasOndeQuebra(comGatilho(comNome(original.frontmatter, NOME, "ads"), GATILHO, "ads"));
  consertadasNoTexto = consertadas;

  rmSync(PARA, { recursive: true, force: true });
  mkdirSync(path.join(PARA, "fluxos"), { recursive: true });
  writeFileSync(path.join(PARA, "SKILL.md"), frontmatter + ["", ...BLOCO, ""].join("\n") + original.corpo);
  cpSync(path.join(tmp, "ads", "references"), path.join(PARA, "references"), { recursive: true });

  for (const fluxo of FLUXOS) {
    const de = path.join(tmp, "skills", fluxo);
    if (!existsSync(path.join(de, "SKILL.md"))) throw Error(`${fluxo}: não existe mais em claude-ads@${pedido}; revise FLUXOS.`);
    // O SKILL.md vira fluxos/<nome>.md, pra não ser lido como skill; o resto da
    // pasta (os modelos de setor do ads-plan, por exemplo) vai pra fluxos/<nome>/.
    cpSync(path.join(de, "SKILL.md"), path.join(PARA, "fluxos", `${fluxo}.md`));
    for (const item of readdirSync(de)) {
      if (item !== "SKILL.md") cpSync(path.join(de, item), path.join(PARA, "fluxos", fluxo, item), { recursive: true });
    }
  }

  mkdirSync(ORIGEM, { recursive: true });
  cpSync(path.join(tmp, "LICENSE"), path.join(ORIGEM, "LICENSE"));
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const mudou = !iguais(antes, lerPasta(PARA));
const arquivoOrigem = path.join(ORIGEM, "UPSTREAM.md");
if (mudou || !existsSync(arquivoOrigem)) {
  writeFileSync(
    arquivoOrigem,
    `# Origem: claude-ads

Espelho da parte de método do https://github.com/AgriciDaniel/claude-ads (licença MIT,
em \`LICENSE\`). Gerado por \`scripts/espelhar-claude-ads.mjs\`; não edite à mão.

- Versão: \`${pedido}\`, commit \`${commit}\` (${data})
- Copiado como veio: \`ads/SKILL.md\` (vira \`skills/${NOME}/SKILL.md\`), a pasta
  \`ads/references/\` inteira e, de cada sub-skill, o \`SKILL.md\` (vira
  \`skills/${NOME}/fluxos/<nome>.md\`) e o resto da pasta (em \`fluxos/<nome>/\`):
  ${FLUXOS.map((f) => `\`${f}\``).join(", ")}.
- Alterado por nós, só no \`SKILL.md\` da condutora: o \`name\` (\`${NOME}\`; no original, \`ads\`),
  uma frase em português no fim da \`description\` (o gatilho) e o bloco "Neste plugin" logo
  depois do frontmatter.${
    consertadasNoTexto.length
      ? `\n- Consertado: aspas em valor que no original quebrava o YAML do frontmatter (${consertadasNoTexto.join(", ")}).`
      : ""
  }
- Nenhuma outra linha mudou.
- Ficaram de fora, de propósito: o motor em Python (\`claude_ads_core\`), \`scripts/\`, os
  agentes (\`agents/\`), o instalador e as sub-skills que escrevem na conta ou dependem do
  motor (create, generate, photoshoot, launch, optimize, report, setup, validate, research,
  dna, landing, competitor) e as das outras plataformas.
- Por que as sub-skills não são skill solta: cada skill ocupa espaço na lista de skills de
  quem instala, e a lista tem orçamento. Quem chega nelas é a \`${NOME}\` e a
  \`gestor-de-trafego\`.
`,
  );
}

console.log(
  mudou
    ? `claude-ads @ ${pedido} (${commit.slice(0, 7)}, ${data}): mudou. Revise com \`git diff\`.`
    : `claude-ads @ ${pedido}: nada mudou; origem mantida.`,
);
