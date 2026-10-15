// =============================================================================
// espelhar-google-ads.mjs — google/skills (GitHub) → plugins/skills
//
// Três skills do time da API do Google Ads, do repositório oficial google/skills
// (licença Apache-2.0). Mesmo princípio do espelho do REA: a NOSSA cópia
// continua existindo se o Google mudar ou apagar a dele, o espelho é de mão
// única e determinístico, e o que mudou se vê no diff do Git antes do commit.
//
// Das 14 skills de anúncios do Google só estas servem a quem roda campanha; as
// outras são de SDK de app (AdMob, IMA) e de subir dado pela Data Manager API.
// Pôr ou tirar uma é mexer em SKILLS aqui e no catalogo.json.
//
// O que é nosso dentro de cada skill: a frase em português no fim da
// `description` (o gatilho), o bloco "Neste plugin" logo depois do frontmatter
// e, onde o original vem com YAML quebrado, as aspas que o consertam. A
// Apache-2.0 pede aviso em arquivo alterado: o próprio bloco diz o que mudou, e
// `origens/google-ads/UPSTREAM.md` guarda o commit de onde veio.
//
// Uso:
//   node scripts/espelhar-google-ads.mjs            # o main de hoje
//   node scripts/espelhar-google-ads.mjs <commit>   # um commit exato
//
// O repositório baixado é dado, não código: só se copiam arquivos de texto;
// nada dele roda aqui.
// =============================================================================

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PE, baixar, comAspasOndeQuebra, comGatilho, conferirPedido, iguais, lerPasta, separar } from "./espelho-comum.mjs";

const REPO = "https://github.com/google/skills.git";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = path.join(RAIZ, "plugins", "skills");
const ORIGEM = path.join(PLUGIN, "origens", "google-ads");

const cabeca = (consertadas) => [
  "> **Neste plugin.** Cópia da skill oficial do time da API do Google Ads (google/skills,",
  "> licença Apache-2.0, em `origens/google-ads/`). Este bloco e a frase em português no fim",
  ...(consertadas.length
    ? [
        `> da \`description\` são nossos, e também as aspas em ${consertadas.map((c) => `\`${c}\``).join(", ")}, que no`,
        "> original quebravam o frontmatter; o resto veio como está.",
      ]
    : ["> da `description` são nossos; o resto veio como está."]),
  ">",
];

// Cada skill: o gatilho em português (sem dois-pontos seguido de espaço nem
// " #", pra continuar YAML válido mesmo numa linha sem aspas) e o miolo do bloco.
const SKILLS = {
  "google-ads-api-account-diagnostics": {
    gatilho:
      "Also use it when the person asks, even in Portuguese, why a Google Ads account or campaign got worse " +
      "(a conversão caiu, o lead sumiu, a verba não gasta, a campanha perdeu impressão, diagnóstico da conta do Google Ads).",
    bloco: [
      "> O servidor MCP do Google Ads não vem no plugin: ele liga com a credencial de cada",
      "> pessoa. Se as ferramentas `search` e `list_accessible_customers` não estiverem aqui,",
      "> diga isso, ofereça ligar com a skill `google-ads-api-mcp-setup` e, enquanto isso, siga",
      "> o caminho sem MCP desta skill. Sem credencial de API, as mesmas perguntas se respondem",
      "> pelos relatórios da própria interface do Google Ads (parcela de impressão perdida por",
      "> orçamento e por classificação, conversões por ação): diga quais colunas e períodos",
      "> abrir, peça pra pessoa colar o resultado aqui e leia junto.",
      ">",
      "> O servidor só lê: nada aqui muda campanha, verba ou lance, quem muda é a pessoa.",
      "> Responda em português e cite a campanha pelo nome, não só pelo ID.",
    ],
  },
  "google-ads-api-mcp-setup": {
    gatilho:
      "Also use it when the person wants to connect Claude to their Google Ads account, even in Portuguese " +
      "(ligar o Claude no Google Ads, conectar a conta de anúncios do Google, instalar o MCP do Google Ads).",
    bloco: [
      "> A skill foi escrita pensando no Claude Desktop. No Claude Code, registre o servidor com",
      "> `claude mcp add --scope user` e as variáveis com `-e`: fica na configuração da própria",
      "> pessoa, fora de qualquer repositório. Não ponha no `.mcp.json` de projeto, que vai pro",
      "> Git, nem em nota ou conversa registrada: developer token, segredo e refresh token são",
      "> credencial. Se a pessoa colar um deles aqui, não repita o valor na resposta. Depois de",
      "> registrar, ela reinicia o Claude Code ou reconecta em `/mcp`.",
      ">",
      "> Token ainda pendente só enxerga conta de teste; a skill `google-ads-api-quickstart`",
      "> explica os níveis de acesso e como pedir.",
    ],
  },
  "google-ads-api-quickstart": {
    gatilho:
      "Also use it when the person asks, even in Portuguese, how to start with the Google Ads API, get a developer token " +
      "or fix an access error (começar na API do Google Ads, tirar o developer token, token não aprovado).",
    bloco: [
      "> Credencial (developer token, ID e segredo de cliente OAuth, refresh token) vai no",
      "> arquivo de configuração da biblioteca na pasta da pessoa ou em variável de ambiente,",
      "> nunca em arquivo que vai pro Git, nota ou conversa registrada. Se a pessoa colar um",
      "> deles aqui, use e não repita o valor na resposta.",
    ],
  },
};

const pedido = conferirPedido(process.argv[2] ?? "main");

// --- baixar só o que interessa do google/skills ------------------------------
const { tmp, commit, data } = baixar(REPO, pedido, ["/LICENSE", ...Object.keys(SKILLS).map((s) => `/skills/ads/${s}/`)]);
const mudaram = [];
const aspas = [];
try {
  for (const [nome, { gatilho, bloco }] of Object.entries(SKILLS)) {
    const de = path.join(tmp, "skills", "ads", nome);
    if (!existsSync(path.join(de, "SKILL.md"))) throw Error(`${nome}: não existe mais em google/skills@${commit}; revise SKILLS.`);
    const para = path.join(PLUGIN, "skills", nome);
    const antes = lerPasta(para);

    rmSync(para, { recursive: true, force: true });
    cpSync(de, para, { recursive: true });

    const arquivoSkill = path.join(para, "SKILL.md");
    const original = separar(readFileSync(arquivoSkill, "utf8"), nome);
    const { texto: frontmatter, consertadas } = comAspasOndeQuebra(comGatilho(original.frontmatter, gatilho, nome));
    if (consertadas.length) aspas.push(`${nome} (${consertadas.join(", ")})`);
    const neste = ["", ...cabeca(consertadas), ...bloco, ...PE, ""].join("\n");
    writeFileSync(arquivoSkill, frontmatter + neste + original.corpo);

    if (!iguais(antes, lerPasta(para))) mudaram.push(nome);
  }

  mkdirSync(ORIGEM, { recursive: true });
  cpSync(path.join(tmp, "LICENSE"), path.join(ORIGEM, "LICENSE"));
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// --- origem: só se o texto de alguma skill mudou ------------------------------
// O google/skills recebe commit todo dia em outras pastas. Regravar o commit sem
// a skill ter mudado abriria PR toda semana por nada.
const arquivoOrigem = path.join(ORIGEM, "UPSTREAM.md");
if (mudaram.length || !existsSync(arquivoOrigem)) {
  writeFileSync(
    arquivoOrigem,
    `# Origem: Google Ads

Espelho de três skills do repositório https://github.com/google/skills, do time da API
do Google Ads (licença Apache-2.0, em \`LICENSE\`). Gerado por
\`scripts/espelhar-google-ads.mjs\`; não edite à mão.

- Commit: \`${commit}\` (${data})
- Copiado: as pastas ${Object.keys(SKILLS).map((s) => `\`skills/ads/${s}\``).join(", ")} como vieram.
- Alterado por nós, em cada \`SKILL.md\`: uma frase em português no fim da \`description\`
  (o gatilho) e o bloco "Neste plugin" logo depois do frontmatter.${
    aspas.length
      ? `\n- Consertado: aspas em valor que no original quebrava o YAML do frontmatter, e com ele a
  skill carregava sem \`description\` e nunca ligava sozinha. Neste commit: ${aspas.join("; ")}.`
      : ""
  }
- Nenhuma outra linha mudou.
- O servidor MCP do Google Ads (https://github.com/googleads/google-ads-mcp) não é
  copiado nem ligado pelo plugin: ele usa a credencial de cada pessoa, que liga o seu
  com a skill \`google-ads-api-mcp-setup\`.
`,
  );
}

console.log(
  mudaram.length
    ? `Google Ads @ ${commit.slice(0, 7)} (${data}): mudou ${mudaram.join(", ")}. Revise com \`git diff\`.`
    : `Google Ads @ ${commit.slice(0, 7)}: nenhuma das ${Object.keys(SKILLS).length} skills mudou; origem mantida.`,
);
