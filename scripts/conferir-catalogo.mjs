// =============================================================================
// conferir-catalogo.mjs — toda skill do plugin tem a sua linha no catálogo.
//
// `catalogo.json` é o que o painel de Skills e o conector mostram (nome, o que
// faz, quando usar). Skill sem entrada ali existe no plugin e some da tela;
// entrada sem pasta promete uma skill que não chega. Roda no gancho de commit,
// junto da trava de dado privado.
//
// Uso: node scripts/conferir-catalogo.mjs        (sai com 1 se faltar ou sobrar)
// =============================================================================

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PASTA = path.join(RAIZ, "plugins", "skills", "skills");

const catalogo = JSON.parse(readFileSync(path.join(RAIZ, "catalogo.json"), "utf8"));
const noCatalogo = new Map((catalogo.skills ?? []).map((s) => [s.slug, s]));
const pastas = readdirSync(PASTA, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(path.join(PASTA, d.name, "SKILL.md")))
  .map((d) => d.name);

const problemas = [];
for (const nome of pastas) {
  const s = noCatalogo.get(nome);
  if (!s) problemas.push(`${nome}: tem pasta e não tem linha no catalogo.json`);
  else for (const campo of ["nome", "resumo", "quando"]) if (!s[campo]?.trim()) problemas.push(`${nome}: falta "${campo}" no catalogo.json`);
}
for (const slug of noCatalogo.keys()) if (!pastas.includes(slug)) problemas.push(`${slug}: está no catalogo.json e não tem pasta em plugins/skills/skills`);

if (problemas.length) {
  console.error(`Catálogo fora do plugin:\n- ${problemas.join("\n- ")}`);
  process.exit(1);
}
console.log(`Catálogo em dia: ${pastas.length} skill(s).`);
