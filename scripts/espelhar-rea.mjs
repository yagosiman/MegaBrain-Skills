// =============================================================================
// espelhar-rea.mjs — pacote rea-agents (npm) → plugins/skills
//
// A skill do REA tem dono: morluto/rea. Este repositório guarda a NOSSA cópia,
// pra que ela continue existindo se o autor mudar ou apagar a dele. O espelho é
// de mão única e determinístico: baixa o pacote publicado, copia a pasta da
// skill como veio, acrescenta só o bloco "Neste plugin" e acerta a versão do REA
// no lançador e na origem. O que mudou se vê no diff do Git antes do commit.
//
// O plugin `skills` não tem `version` no plugin.json de propósito: assim quem
// instalou recebe cada commit, sem ninguém precisar subir número. A versão do
// REA mora só na linha `REA=` do `bin/rea-mcp` e em `origens/rea/UPSTREAM.md`.
//
// Uso:
//   node scripts/espelhar-rea.mjs           # a versão mais nova publicada
//   node scripts/espelhar-rea.mjs 6.5.0     # uma versão exata
//
// O pacote baixado é dado, não código: só se extrai e se copiam arquivos de
// texto; nada dele roda aqui (`--ignore-scripts` no pack).
// =============================================================================

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACOTE = "rea-agents";
const SKILL = "reverse-engineer-anything";
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = path.join(RAIZ, "plugins", "skills");
const ORIGEM = path.join(PLUGIN, "origens", "rea");
const LANCADOR = path.join(PLUGIN, "bin", "rea-mcp");
const GATILHO_PT =
  "Also use it when the person sends the link of a website, app or program (or its file) and wants to understand how it works inside or rebuild something like it, " +
  "even in Portuguese and without saying reverse engineering (como esse site funciona, quero recriar isso, o que esse app faz por baixo).";

const pedido = process.argv[2] ?? "latest";
const npm = (...args) => execFileSync("npm", args, { encoding: "utf8" }).trim();

const versao = npm("view", `${PACOTE}@${pedido}`, "version");
if (!/^\d+\.\d+\.\d+$/.test(versao)) throw Error(`Versão inesperada do npm: "${versao}"`);
const integridade = npm("view", `${PACOTE}@${versao}`, "dist.integrity");

const linhaRea = /^REA="rea-agents@([^"]+)"/m;
const lancador = readFileSync(LANCADOR, "utf8");
if (!linhaRea.test(lancador)) throw Error("bin/rea-mcp sem a linha REA=: revise o lançador.");
const anterior = lancador.match(linhaRea)[1];

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
  // O gatilho em português. A skill liga sozinha quando o pedido bate com a
  // `description`, e a do REA só fala de alvo técnico em inglês: quem manda o
  // link de um site e escreve "quero recriar isso" não casava. A frase vai no
  // fim da mesma linha, sem dois-pontos nem aspas (é YAML sem aspas).
  const frontmatter = texto.slice(0, corte).replace(/^(description: .+)$/m, `$1 ${GATILHO_PT}`);
  if (!frontmatter.includes(GATILHO_PT)) throw Error("SKILL.md sem `description:` numa linha só: o formato do REA mudou, revise o espelho.");
  const bloco = [
    "",
    "> **Neste plugin.** O servidor MCP do REA já vem pelo plugin `skills` (`bin/rea-mcp`,",
    `> que roda \`${PACOTE}@${versao}\`). Ele usa o Node da máquina se servir e, se não,`,
    "> baixa sozinho um Node privado na pasta de dados do plugin: não peça pra pessoa",
    "> instalar Node e não rode `rea setup`, que registraria uma segunda cópia fora do",
    "> plugin. Na primeira sessão depois de instalar, o plugin se prepara em segundo plano",
    "> (uns 2 minutos); se as ferramentas do REA não estiverem aqui, diga isso à pessoa e",
    "> peça pra reconectar o servidor em `/mcp` quando terminar. O registro fica em",
    "> `~/.claude/plugins/data/skills-yagosiman/preparar-*.log`.",
    ">",
    "> Com o conector do MegaBrain ligado, ao terminar registre com `skill_registrar`",
    "> (tipo `uso` e o que fez numa frase; se falhou, tipo `erro` e o motivo): é o que",
    "> mostra no painel de Skills do Cérebro que ela está viva.",
    "",
  ].join("\n");
  writeFileSync(arquivoSkill, frontmatter + bloco + texto.slice(corte));

  // --- licença e aviso de uso responsável -----------------------------------
  mkdirSync(ORIGEM, { recursive: true });
  for (const arquivo of ["LICENSE", "DISCLAIMER.md"]) {
    cpSync(path.join(origem, arquivo), path.join(ORIGEM, arquivo));
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// --- versão do REA no lançador e na origem -------------------------------------
writeFileSync(LANCADOR, lancador.replace(linhaRea, `REA="${PACOTE}@${versao}"`));

writeFileSync(
  path.join(ORIGEM, "UPSTREAM.md"),
  `# Origem: REA

Espelho do pacote npm \`${PACOTE}\`, do repositório https://github.com/morluto/rea
(licença MIT, em \`LICENSE\`). Gerado por \`scripts/espelhar-rea.mjs\`; não edite à mão.

- Versão: ${versao}
- Integridade do pacote: \`${integridade}\`
- Copiado: a pasta \`skills/${SKILL}\` como veio, mais o bloco "Neste plugin" logo
  depois do frontmatter do \`SKILL.md\`; \`LICENSE\` e \`DISCLAIMER.md\` aqui ao lado.
- O servidor MCP não é copiado: o \`bin/rea-mcp\` instala o pacote publicado na pasta
  de dados do plugin e liga, com o Node da máquina ou um Node privado na mesma pasta.
  Cada versão também fica guardada como Release \`rea-<versão>\` deste repositório.
`,
);

console.log(
  versao === anterior
    ? `REA ${versao}: espelho refeito na mesma versão. Veja \`git status\` pra saber se o texto mudou.`
    : `REA ${anterior} → ${versao}: skill, licença e versão atualizadas. Revise com \`git diff\`.`,
);
if (!existsSync(path.join(PLUGIN, "skills", SKILL, "SKILL.md"))) process.exit(1);
