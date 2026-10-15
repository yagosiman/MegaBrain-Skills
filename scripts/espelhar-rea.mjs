// =============================================================================
// espelhar-rea.mjs — pacote rea-agents (npm) → plugins/rea
//
// A skill do REA tem dono: morluto/rea. Este repositório guarda a NOSSA cópia,
// pra que ela continue existindo se o autor mudar ou apagar a dele. O espelho é
// de mão única e determinístico: baixa o pacote publicado, copia a pasta da
// skill como veio, acrescenta só o bloco "Neste plugin" e acerta a versão nos
// três lugares que a citam. O que mudou se vê no diff do Git antes do commit.
//
// Uso:
//   node scripts/espelhar-rea.mjs           # a versão mais nova publicada
//   node scripts/espelhar-rea.mjs 6.5.0     # uma versão exata
//
// O pacote baixado é dado, não código: só se extrai e se copiam arquivos de
// texto; nada dele roda aqui (`--ignore-scripts` no pack).
// =============================================================================

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACOTE = "rea-agents";
const SKILL = "reverse-engineer-anything";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = path.join(RAIZ, "plugins", "rea");

const pedido = process.argv[2] ?? "latest";
const npm = (...args) => execFileSync("npm", args, { encoding: "utf8" }).trim();

const versao = npm("view", `${PACOTE}@${pedido}`, "version");
if (!/^\d+\.\d+\.\d+$/.test(versao)) throw Error(`Versão inesperada do npm: "${versao}"`);
const integridade = npm("view", `${PACOTE}@${versao}`, "dist.integrity");

const lerJson = (arquivo) => JSON.parse(readFileSync(arquivo, "utf8"));
const gravarJson = (arquivo, dado) => writeFileSync(arquivo, JSON.stringify(dado, null, 2) + "\n");

const anterior = lerJson(path.join(PLUGIN, ".claude-plugin", "plugin.json")).version;

// --- baixar e extrair --------------------------------------------------------
const tmp = mkdtempSync(path.join(tmpdir(), "espelho-rea-"));
try {
  const tgz = npm("pack", `${PACOTE}@${versao}`, "--ignore-scripts", "--silent", "--pack-destination", tmp)
    .split("\n").pop();
  execFileSync("tar", ["-xzf", path.join(tmp, tgz), "-C", tmp]);
  const origem = path.join(tmp, "package");

  // --- a skill, como veio ----------------------------------------------------
  const destinoSkill = path.join(PLUGIN, "skills", SKILL);
  rmSync(destinoSkill, { recursive: true, force: true });
  cpSync(path.join(origem, "skills", SKILL), destinoSkill, { recursive: true });

  // O único texto nosso dentro da skill. A recuperação do REA manda instalar o
  // Node e rodar `rea setup`, que registra um segundo servidor fora do plugin;
  // aqui o `bin/rea-mcp` resolve os dois. Vai logo depois do frontmatter pra ser
  // lido antes da seção de conexão.
  const arquivoSkill = path.join(destinoSkill, "SKILL.md");
  const texto = readFileSync(arquivoSkill, "utf8");
  const fim = texto.indexOf("\n---\n", 4);
  if (!texto.startsWith("---\n") || fim < 0) throw Error("SKILL.md sem frontmatter: o formato do REA mudou, revise o espelho.");
  const corte = fim + "\n---\n".length;
  const bloco = [
    "",
    "> **Neste plugin.** O servidor MCP do REA já vem pelo plugin `rea` (`bin/rea-mcp`,",
    `> que roda \`${PACOTE}@${versao}\`). Ele usa o Node da máquina se servir e, se não,`,
    "> baixa sozinho um Node privado na pasta de dados do plugin: não peça pra pessoa",
    "> instalar Node e não rode `rea setup`, que registraria uma segunda cópia fora do",
    "> plugin. Na primeira sessão depois de instalar, o plugin se prepara em segundo plano",
    "> (uns 2 minutos); se as ferramentas do REA não estiverem aqui, diga isso à pessoa e",
    "> peça pra reconectar o servidor em `/mcp` quando terminar. O registro fica em",
    "> `~/.claude/plugins/data/rea-yagosiman/preparar-*.log`.",
    "",
  ].join("\n");
  writeFileSync(arquivoSkill, texto.slice(0, corte) + bloco + texto.slice(corte));

  // --- licença e aviso de uso responsável -----------------------------------
  for (const arquivo of ["LICENSE", "DISCLAIMER.md"]) {
    cpSync(path.join(origem, arquivo), path.join(PLUGIN, arquivo));
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// --- versão nos três lugares --------------------------------------------------
const arquivoPlugin = path.join(PLUGIN, ".claude-plugin", "plugin.json");
const plugin = lerJson(arquivoPlugin);
plugin.version = versao;
gravarJson(arquivoPlugin, plugin);

const arquivoLancador = path.join(PLUGIN, "bin", "rea-mcp");
const lancador = readFileSync(arquivoLancador, "utf8");
const linhaRea = /^REA="rea-agents@[^"]+"/m;
if (!linhaRea.test(lancador)) throw Error("bin/rea-mcp sem a linha REA=: revise o lançador.");
writeFileSync(arquivoLancador, lancador.replace(linhaRea, `REA="${PACOTE}@${versao}"`));

writeFileSync(
  path.join(PLUGIN, "UPSTREAM.md"),
  `# Origem

Espelho do pacote npm \`${PACOTE}\`, do repositório https://github.com/morluto/rea
(licença MIT, em \`LICENSE\`). Gerado por \`scripts/espelhar-rea.mjs\`; não edite à mão.

- Versão: ${versao}
- Integridade do pacote: \`${integridade}\`
- Copiado: a pasta \`skills/${SKILL}\` como veio, mais o bloco "Neste plugin" logo
  depois do frontmatter do \`SKILL.md\`; \`LICENSE\` e \`DISCLAIMER.md\`.
- O servidor MCP não é copiado: o \`bin/rea-mcp\` instala o pacote publicado na pasta
  de dados do plugin e liga, com o Node da máquina ou um Node privado na mesma pasta.
`,
);

console.log(
  versao === anterior
    ? `REA ${versao}: espelho refeito na mesma versão. Veja \`git status\` pra saber se o texto mudou.`
    : `REA ${anterior} → ${versao}: skill, licença e versão atualizadas. Revise com \`git diff\`.`,
);
if (!existsSync(path.join(PLUGIN, "skills", SKILL, "SKILL.md"))) process.exit(1);
