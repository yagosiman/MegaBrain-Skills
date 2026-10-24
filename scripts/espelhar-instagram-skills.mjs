// =============================================================================
// espelhar-instagram-skills.mjs — sergebulaev/instagram-skills (GitHub) → plugins/skills
//
// O instagram-skills (licença MIT) são 9 skills de conteúdo pro Instagram:
// legenda, carrossel, gancho de Reel que viralizou, hashtag, plano da semana,
// reaproveitar conteúdo de outra rede, perfil, leitura do nicho e o "humanizer"
// (tira o que denuncia texto de IA). Vem junto um publicador em Python (Publora)
// e leitores pagos (Apify, Pixfaro).
//
// O recorte, e por quê:
//   - Nenhuma delas vira skill solta. A porta é a nossa `gestor-de-instagram`,
//     em português, e o método fica como arquivo em
//     `gestor-de-instagram/metodo/<nome>.md`, com o texto como veio. Cada skill
//     solta ocupa espaço na lista de skills de quem instala (a lista tem
//     orçamento), e 9 skills em inglês iam disputar o gatilho com a porta.
//   - As referências da raiz entram em `metodo/references/`, menos a do fluxo
//     de publicar (`media-workflow.md`): aqui ninguém posta pela pessoa.
//   - Não vêm `lib/` (Publora, Apify, Pixfaro), `scripts/`, o SKILL.md da raiz
//     (o índice do pacote, que a nossa porta substitui) nem os manifestos.
//   - Este espelho só reescreve `metodo/`. O SKILL.md da porta é nosso e não
//     se toca daqui.
//
// Versão: a tag vX.Y.Z mais nova (o autor publica por tag). Uso:
//   node scripts/espelhar-instagram-skills.mjs            # a tag mais nova
//   node scripts/espelhar-instagram-skills.mjs v1.0.9     # uma tag ou commit exato
//
// O repositório baixado é dado, não código: só se copiam arquivos de texto;
// nada dele roda aqui.
// =============================================================================

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { baixar, conferirPedido, iguais, lerPasta, tagMaisNova } from "./espelho-comum.mjs";

const REPO = "https://github.com/sergebulaev/instagram-skills.git";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = path.join(RAIZ, "plugins", "skills");
const ORIGEM = path.join(PLUGIN, "origens", "instagram-skills");
const PORTA = "gestor-de-instagram";
const PARA = path.join(PLUGIN, "skills", PORTA, "metodo");

// As skills do autor que entram como método. Pôr ou tirar uma é mexer aqui
// (e na tabela da porta, que o Claude lê).
const METODOS = [
  "ig-caption-writer",
  "ig-carousel-planner",
  "ig-hook-extractor",
  "ig-hashtag-strategist",
  "ig-content-planner",
  "ig-repurposer",
  "ig-profile-optimizer",
  "ig-audience-insights",
  "ig-humanizer",
];

// Referência da raiz que não entra: é o passo a passo de publicar.
const FORA = ["media-workflow.md"];

const pedido = conferirPedido(process.argv[2] ?? tagMaisNova(REPO));

if (!existsSync(path.join(PLUGIN, "skills", PORTA, "SKILL.md"))) throw Error(`${PORTA}/SKILL.md não existe: a porta é nossa e vem antes do espelho.`);

const antes = lerPasta(PARA);
const { tmp, commit, data } = baixar(REPO, pedido, ["/LICENSE", "/references/", ...METODOS.map((m) => `/skills/${m}/`)]);
try {
  rmSync(PARA, { recursive: true, force: true });
  mkdirSync(path.join(PARA, "references"), { recursive: true });

  for (const nome of readdirSync(path.join(tmp, "references"))) {
    if (!FORA.includes(nome)) cpSync(path.join(tmp, "references", nome), path.join(PARA, "references", nome), { recursive: true });
  }

  for (const metodo of METODOS) {
    const de = path.join(tmp, "skills", metodo);
    if (!existsSync(path.join(de, "SKILL.md"))) throw Error(`${metodo}: não existe mais em instagram-skills@${pedido}; revise METODOS.`);
    // O SKILL.md vira metodo/<nome>.md, pra não ser lido como skill; o resto da
    // pasta (references/, sub-skills/) vai pra metodo/<nome>/.
    cpSync(path.join(de, "SKILL.md"), path.join(PARA, `${metodo}.md`));
    for (const item of readdirSync(de)) {
      if (item !== "SKILL.md") cpSync(path.join(de, item), path.join(PARA, metodo, item), { recursive: true });
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
    `# Origem: instagram-skills

Espelho da parte de método do https://github.com/sergebulaev/instagram-skills (licença MIT,
em \`LICENSE\`). Gerado por \`scripts/espelhar-instagram-skills.mjs\`; não edite à mão.

- Versão: \`${pedido}\`, commit \`${commit}\` (${data})
- Copiado como veio, sem mudar uma linha: de cada skill, o \`SKILL.md\` (vira
  \`skills/${PORTA}/metodo/<nome>.md\`) e o resto da pasta (em \`metodo/<nome>/\`):
  ${METODOS.map((m) => `\`${m}\``).join(", ")}; e a pasta \`references/\` da raiz (em
  \`metodo/references/\`), menos ${FORA.map((f) => `\`${f}\``).join(", ")}.
- A porta, \`skills/${PORTA}/SKILL.md\`, é nossa (em português) e não vem do autor.
- Ficaram de fora, de propósito: \`lib/\` (os clientes em Python do Publora, do Apify e do
  Pixfaro), \`scripts/\`, o \`SKILL.md\` da raiz, os manifestos de plugin e o passo a passo
  de publicar. Aqui ninguém posta pela pessoa: as skills escrevem, a pessoa posta.
- Por que as skills do autor não são skill solta: cada skill ocupa espaço na lista de skills
  de quem instala, e a lista tem orçamento. Quem chega nelas é a \`${PORTA}\`.
`,
  );
}

console.log(
  mudou
    ? `instagram-skills @ ${pedido} (${commit.slice(0, 7)}, ${data}): mudou. Revise com \`git diff\`.`
    : `instagram-skills @ ${pedido}: nada mudou; origem mantida.`,
);
