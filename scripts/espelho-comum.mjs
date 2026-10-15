// =============================================================================
// espelho-comum.mjs — o que os espelhos de skill de fora têm em comum.
//
// Usado por espelhar-google-ads.mjs, espelhar-claude-ads.mjs e
// espelhar-marketingskills.mjs. Cada espelho baixa só as pastas que interessam
// do repositório do autor, copia o texto como veio e acrescenta o que é nosso:
// a frase em português no fim da `description` (o gatilho) e o bloco "Neste
// plugin" logo depois do frontmatter. Conserto aqui vale pros três.
//
// O repositório baixado é dado, não código: só se copiam arquivos de texto;
// nada dele roda aqui.
// =============================================================================

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

/** Fim comum do bloco "Neste plugin": como a skill conta que está viva. */
export const PE = [
  ">",
  "> Com o conector do MegaBrain ligado, ao terminar registre com `skill_registrar`",
  "> (tipo `uso` e o que fez numa frase; se falhou, tipo `erro` e o motivo): é o que",
  "> mostra no painel de Skills do Cérebro que ela está viva.",
];

/** Commit, tag ou ramo pedido na linha de comando, sem nada que vire opção do git. */
export function conferirPedido(pedido) {
  if (!/^[A-Za-z0-9._/-]+$/.test(pedido) || pedido.startsWith("-")) throw Error(`Commit, tag ou ramo inesperado: "${pedido}"`);
  return pedido;
}

/**
 * Baixa só os caminhos pedidos (sparse checkout, sem histórico) numa pasta
 * temporária. Quem chama apaga a pasta no `finally`.
 */
export function baixar(repo, pedido, caminhos) {
  const tmp = mkdtempSync(path.join(tmpdir(), "espelho-"));
  git(tmp, "init", "-q");
  git(tmp, "remote", "add", "origin", repo);
  git(tmp, "sparse-checkout", "set", "--no-cone", ...caminhos);
  git(tmp, "fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", pedido);
  git(tmp, "checkout", "-q", "FETCH_HEAD");
  return { tmp, commit: git(tmp, "rev-parse", "FETCH_HEAD"), data: git(tmp, "log", "-1", "--format=%cs", "FETCH_HEAD") };
}

/** A tag de versão mais nova (vX.Y.Z) de um repositório, sem baixar nada. */
export function tagMaisNova(repo) {
  const tags = execFileSync("git", ["ls-remote", "--tags", "--refs", repo, "v*"], { encoding: "utf8" })
    .split("\n")
    .map((l) => l.split("refs/tags/")[1])
    .filter((t) => t && /^v\d+\.\d+\.\d+$/.test(t));
  if (!tags.length) throw Error(`${repo}: nenhuma tag vX.Y.Z; passe a versão na mão.`);
  const num = (t) => t.slice(1).split(".").map(Number);
  return tags.sort((a, b) => {
    const [x, y] = [num(a), num(b)];
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  }).at(-1);
}

/** Todos os arquivos de uma pasta, por caminho relativo, pra saber se o texto mudou. */
export function lerPasta(pasta) {
  const mapa = new Map();
  if (!existsSync(pasta)) return mapa;
  for (const item of readdirSync(pasta, { recursive: true, withFileTypes: true })) {
    if (!item.isFile()) continue;
    const cheio = path.join(item.parentPath, item.name);
    mapa.set(path.relative(pasta, cheio), readFileSync(cheio, "utf8"));
  }
  return mapa;
}
export const iguais = (a, b) => a.size === b.size && [...a].every(([k, v]) => b.get(k) === v);

/** Separa o frontmatter (com os dois `---`) do corpo de um SKILL.md. */
export function separar(texto, nome) {
  const fim = texto.indexOf("\n---\n", 4);
  if (!texto.startsWith("---\n") || fim < 0) throw Error(`${nome}: SKILL.md sem frontmatter; o formato do autor mudou, revise o espelho.`);
  const corte = fim + "\n---\n".length;
  return { frontmatter: texto.slice(0, corte), corpo: texto.slice(corte) };
}

/**
 * Aspas em valor de primeiro nível que o YAML não aceita sem elas (dois-pontos
 * seguido de espaço, ou " #"). Frontmatter que não abre faz o Claude carregar a
 * skill sem `description`: ela nunca liga sozinha. Devolve o texto e as chaves
 * consertadas.
 */
export function comAspasOndeQuebra(frontmatter) {
  const consertadas = [];
  const texto = frontmatter
    .split("\n")
    .map((linha) => {
      const m = linha.match(/^([A-Za-z_][\w-]*):\s+(.+)$/);
      if (!m) return linha;
      const [, chave, valor] = m;
      if (/^["'>|[{&*!]/.test(valor) || !/: | #/.test(valor)) return linha;
      consertadas.push(chave);
      return `${chave}: ${JSON.stringify(valor)}`;
    })
    .join("\n");
  return { texto, consertadas };
}

/**
 * Põe o gatilho no fim da `description`: numa linha só, entre aspas (simples ou
 * duplas) ou num bloco `>-` / `|`. O gatilho não leva aspas, barra invertida,
 * dois-pontos seguido de espaço nem " #", pra continuar YAML válido em qualquer
 * um dos formatos.
 */
export function comGatilho(frontmatter, gatilho, nome) {
  if (/["'\\]|: | #/.test(gatilho)) throw Error(`${nome}: gatilho com aspas, barra, ": " ou " #"; reescreva.`);
  const linhas = frontmatter.split("\n");
  const i = linhas.findIndex((l) => l.startsWith("description:"));
  if (i < 0) throw Error(`${nome}: SKILL.md sem \`description:\`; o formato do autor mudou, revise o espelho.`);
  const valor = linhas[i].slice("description:".length).trim();
  if (/^["']/.test(valor)) {
    const aspa = valor[0];
    if (valor.length < 2 || !valor.endsWith(aspa)) throw Error(`${nome}: \`description\` entre aspas em mais de uma linha; revise o espelho.`);
    linhas[i] = `${linhas[i].slice(0, -1)} ${gatilho}${aspa}`;
    return linhas.join("\n");
  }
  if (!/^[>|][+-]?$/.test(valor)) {
    linhas[i] = `${linhas[i]} ${gatilho}`;
    return linhas.join("\n");
  }
  // Bloco: as linhas seguintes recuadas (ou em branco) são o texto.
  let ultima = i;
  for (let j = i + 1; j < linhas.length && (linhas[j] === "" || /^\s/.test(linhas[j])); j++) {
    if (linhas[j].trim()) ultima = j;
  }
  if (ultima === i) throw Error(`${nome}: \`description\` em bloco vazio; revise o espelho.`);
  const recuo = linhas[i + 1].match(/^\s*/)[0] || "  ";
  linhas.splice(ultima + 1, 0, "", `${recuo}${gatilho}`);
  return linhas.join("\n");
}

/** Troca o `name:` do frontmatter, quando a skill entra aqui com outro nome. */
export function comNome(frontmatter, novo, nome) {
  const linhas = frontmatter.split("\n");
  const i = linhas.findIndex((l) => l.startsWith("name:"));
  if (i < 0) throw Error(`${nome}: SKILL.md sem \`name:\`; revise o espelho.`);
  linhas[i] = `name: ${novo}`;
  return linhas.join("\n");
}
