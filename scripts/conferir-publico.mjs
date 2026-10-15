// =============================================================================
// conferir-publico.mjs — barra dado privado antes de ele ir pro repositório.
//
// Este repositório é público. Roda no gancho de commit (`.githooks/pre-commit`) e
// na Action `Conferir o que é público`. Procura dois tipos de coisa:
//
//   1. Padrões que nunca são método: chave e token, endereço de banco Supabase,
//      JWT, caminho de máquina, e-mail, CPF e telefone.
//   2. Nomes de cliente, de pessoa e de projeto privado. A lista NÃO mora aqui,
//      porque publicar a lista seria publicar os nomes: vem de `.nomes-proibidos`
//      (fora do Git, uma entrada por linha) e da variável CONFERIR_NOMES (o secret
//      da Action). Ao achar um, o aviso diz o número da entrada, nunca o nome.
//
// Uso: node scripts/conferir-publico.mjs        (sai com 1 se achar alguma coisa)
// =============================================================================

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PADROES = [
  ["endereço de banco Supabase", /\b[a-z0-9]{20}\.supabase\.(co|in)\b/],
  ["JWT (chave do Supabase e afins)", /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/],
  ["chave de API", /\b(sk-[A-Za-z0-9_-]{20,}|sk_live_[A-Za-z0-9]{10,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[abprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,})/],
  // Montado em duas partes pra a própria trava não se acusar.
  ["chave de serviço do Supabase", new RegExp("service" + "_role", "i")],
  ["caminho de máquina", /\/Users\/[a-z]|\/home\/[a-z][a-z0-9_-]*\/|[A-Z]:\\Users\\/],
  ["e-mail", /\b[A-Za-z0-9._%+-]+@(?!example\.|users\.noreply\.github\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/],
  ["CPF", /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/],
  ["telefone", /\(?\b\d{2}\)?\s?9\d{4}-?\d{4}\b|\+55\s?\d{2}/],
];

const tirarAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const entradas = [
  ...(existsSync(path.join(RAIZ, ".nomes-proibidos")) ? readFileSync(path.join(RAIZ, ".nomes-proibidos"), "utf8").split("\n") : []),
  ...(process.env.CONFERIR_NOMES ?? "").split(/\n|,/),
]
  .map((n) => n.trim())
  .filter((n) => n && !n.startsWith("#"));
const nomes = entradas.map((n, i) => [i + 1, new RegExp(`(^|[^a-z0-9])${escapar(tirarAcento(n))}($|[^a-z0-9])`)]);

// Arquivos que vão pro Git: os rastreados e os novos que o .gitignore não esconde.
const arquivos = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: RAIZ, encoding: "utf8" })
  .split("\n")
  .filter((f) => f && existsSync(path.join(RAIZ, f)));

const achados = [];
for (const arquivo of arquivos) {
  const conteudo = readFileSync(path.join(RAIZ, arquivo));
  if (conteudo.includes(0)) continue; // binário
  conteudo.toString("utf8").split("\n").forEach((linha, i) => {
    for (const [rotulo, re] of PADROES) if (re.test(linha)) achados.push(`${arquivo}:${i + 1}  ${rotulo}`);
    const limpa = tirarAcento(linha);
    for (const [n, re] of nomes) if (re.test(limpa)) achados.push(`${arquivo}:${i + 1}  nome proibido (entrada ${n} da lista)`);
  });
}

if (!nomes.length) console.warn("Aviso: sem lista de nomes (.nomes-proibidos ou CONFERIR_NOMES); conferi só os padrões.");
if (achados.length) {
  console.error(`Dado privado no que vai pro repositório público (${achados.length}):\n  ${achados.join("\n  ")}`);
  process.exit(1);
}
console.log(`Nada privado em ${arquivos.length} arquivos${nomes.length ? ` (${nomes.length} nomes conferidos)` : ""}.`);
