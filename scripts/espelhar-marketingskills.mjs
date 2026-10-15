// =============================================================================
// espelhar-marketingskills.mjs — coreyhaines31/marketingskills (GitHub) → plugins/skills
//
// Duas skills de anúncio do marketingskills (licença MIT): `ads` (estratégia,
// estrutura, verba, quando matar ou escalar um anúncio) e `ad-creative` (copy e
// variação de criativo em escala). Mesmo princípio dos outros espelhos: a NOSSA
// cópia continua existindo se o autor mudar ou apagar a dele, o espelho é de
// mão única e determinístico, e o que mudou se vê no diff do Git.
//
// O autor publica várias vezes por semana, em todas as skills; a origem só é
// regravada quando o texto de uma das nossas duas muda.
//
// Uso:
//   node scripts/espelhar-marketingskills.mjs            # o main de hoje
//   node scripts/espelhar-marketingskills.mjs <commit>   # um commit exato
// =============================================================================

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PE, baixar, comAspasOndeQuebra, comGatilho, conferirPedido, iguais, lerPasta, separar } from "./espelho-comum.mjs";

const REPO = "https://github.com/coreyhaines31/marketingskills.git";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = path.join(RAIZ, "plugins", "skills");
const ORIGEM = path.join(PLUGIN, "origens", "marketingskills");

const cabeca = (nome, consertadas) => [
  `> **Neste plugin.** Cópia da skill \`${nome}\` do marketingskills (coreyhaines31/marketingskills,`,
  "> licença MIT, em `origens/marketingskills/`). Este bloco e a frase em português no fim",
  ...(consertadas.length
    ? [
        `> da \`description\` são nossos, e também as aspas em ${consertadas.map((c) => `\`${c}\``).join(", ")}, que no`,
        "> original quebravam o frontmatter; o resto veio como está.",
      ]
    : ["> da `description` são nossos; o resto veio como está."]),
  ">",
];

// O que vale pras duas: de onde vem o dado da conta e o que não vem junto.
const COMUM = [
  "> As CLIs, integrações e serviços que o texto cita (`tools/...` do repositório do autor,",
  "> conector de relatório, o agente pago do próprio autor) não vêm no plugin e não são",
  "> indicação nossa. Conta de anúncio se lê pelo conector oficial de cada plataforma",
  "> (Meta, TikTok for Business, Google Ads pela skill `google-ads-api-mcp-setup`), ligado",
  "> pela própria pessoa, ou pelo export que ela colar. Aqui só se lê: pausar, mudar verba,",
  "> criar ou subir anúncio é com a pessoa; entregue a recomendação e o passo a passo.",
  ">",
  "> O contexto de produto que o texto procura em `.agents/product-marketing.md` mora, no",
  "> MegaBrain, no mapa do cliente: leia pelo conector se ele estiver ligado, e pergunte só",
  "> o que faltar. Em português, a porta de entrada é a skill `gestor-de-trafego`, que usa",
  "> esta como referência. Responda na língua da pessoa.",
];

// Cada skill: o gatilho em português (sem aspas, barra, ": " nem " #") e o miolo do bloco.
const SKILLS = {
  ads: {
    gatilho:
      "Also use it when the person asks, even in Portuguese, about paid ads strategy " +
      "(estratégia de anúncio pago, quando matar ou escalar um anúncio, estrutura de campanha, público, lance, verba).",
    bloco: [
      "> Muitos números do texto e das referências (regras de corte, benchmark, payback) vêm de",
      "> conta em dólar e de B2B ou SaaS. Pra outra moeda, outro ticket ou varejo, trate como",
      "> hipótese a conferir com os dados da conta, não como regra.",
      ">",
      ...COMUM,
    ],
  },
  "ad-creative": {
    gatilho:
      "Also use it when the person asks, even in Portuguese, for ad copy or creative variations " +
      "(variação de copy de anúncio, título e texto de anúncio, gancho de vídeo curto, criativo novo pra testar).",
    bloco: [
      "> O que esta skill produz é rascunho pra pessoa revisar: nada sobe pra conta sozinho. Pra",
      "> conta brasileira a copy sai em português do Brasil; os ganchos e fórmulas em inglês",
      "> servem de estrutura, não de tradução literal.",
      ">",
      ...COMUM,
    ],
  },
};

const pedido = conferirPedido(process.argv[2] ?? "main");

const { tmp, commit, data } = baixar(REPO, pedido, ["/LICENSE", ...Object.keys(SKILLS).map((s) => `/skills/${s}/`)]);
const mudaram = [];
const aspas = [];
try {
  for (const [nome, { gatilho, bloco }] of Object.entries(SKILLS)) {
    const de = path.join(tmp, "skills", nome);
    if (!existsSync(path.join(de, "SKILL.md"))) throw Error(`${nome}: não existe mais em marketingskills@${commit}; revise SKILLS.`);
    const para = path.join(PLUGIN, "skills", nome);
    const antes = lerPasta(para);

    rmSync(para, { recursive: true, force: true });
    cpSync(de, para, { recursive: true });

    const arquivoSkill = path.join(para, "SKILL.md");
    const original = separar(readFileSync(arquivoSkill, "utf8"), nome);
    const { texto: frontmatter, consertadas } = comAspasOndeQuebra(comGatilho(original.frontmatter, gatilho, nome));
    if (consertadas.length) aspas.push(`${nome} (${consertadas.join(", ")})`);
    const neste = ["", ...cabeca(nome, consertadas), ...bloco, ...PE, ""].join("\n");
    writeFileSync(arquivoSkill, frontmatter + neste + original.corpo);

    if (!iguais(antes, lerPasta(para))) mudaram.push(nome);
  }

  mkdirSync(ORIGEM, { recursive: true });
  cpSync(path.join(tmp, "LICENSE"), path.join(ORIGEM, "LICENSE"));
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const arquivoOrigem = path.join(ORIGEM, "UPSTREAM.md");
if (mudaram.length || !existsSync(arquivoOrigem)) {
  writeFileSync(
    arquivoOrigem,
    `# Origem: marketingskills

Espelho de duas skills do repositório https://github.com/coreyhaines31/marketingskills
(licença MIT, em \`LICENSE\`). Gerado por \`scripts/espelhar-marketingskills.mjs\`; não
edite à mão.

- Commit: \`${commit}\` (${data})
- Copiado: as pastas ${Object.keys(SKILLS).map((s) => `\`skills/${s}\``).join(", ")} como vieram.
- Alterado por nós, em cada \`SKILL.md\`: uma frase em português no fim da \`description\`
  (o gatilho) e o bloco "Neste plugin" logo depois do frontmatter.${
    aspas.length ? `\n- Consertado: aspas em valor que no original quebrava o YAML do frontmatter. Neste commit: ${aspas.join("; ")}.` : ""
  }
- Nenhuma outra linha mudou.
- Não copiados: \`tools/\` (as CLIs e integrações do autor) e as outras skills do repositório.
`,
  );
}

console.log(
  mudaram.length
    ? `marketingskills @ ${commit.slice(0, 7)} (${data}): mudou ${mudaram.join(", ")}. Revise com \`git diff\`.`
    : `marketingskills @ ${commit.slice(0, 7)}: nenhuma das ${Object.keys(SKILLS).length} skills mudou; origem mantida.`,
);
