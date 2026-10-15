# MegaBrain-Skills

As skills do MegaBrain num lugar só. Cada pasta em `plugins/` é uma skill (ou um conjunto
delas), e quem adiciona este repositório no Claude Code instala qualquer uma com um comando
e recebe as atualizações.

**Este repositório é público.** Aqui só entra método que qualquer pessoa pode ler: nada de
dado de quem usa o MegaBrain, nome de cliente ou de pessoa, conversa, chave, endereço de
banco ou caminho de máquina. A trava (`scripts/conferir-publico.mjs`) barra isso no commit e
no GitHub.

**O nome é de vitrine.** "MegaBrain" aparece só em texto (este README e as descrições do
`marketplace.json`). Nada que alguém digita ou que fica instalado carrega o nome: o
marketplace é `yagosiman` (`rea@yagosiman`) e os arquivos ficam na pasta de dados de cada
plugin. Trocar o nome do produto é trocar esse texto e, se quiser, renomear o repositório
(o GitHub redireciona o endereço antigo, e quem já instalou não percebe).

## Instalar

O jeito mais simples é colar isto pro próprio Claude Code e deixar ele fazer:

> Instala as skills do MegaBrain: roda `claude plugin marketplace add yagosiman/MegaBrain-Skills`
> e depois `claude plugin install rea@yagosiman`. Quando terminar, me avisa pra reiniciar.

Ou, no terminal do Claude Code, os mesmos dois passos:

```
/plugin marketplace add yagosiman/MegaBrain-Skills
/plugin install rea@yagosiman
```

Depois, reinicie o Claude Code. Pra receber atualização sozinho: `/plugin` → Marketplaces →
yagosiman → ativar a atualização automática (vem desligada pra marketplace de fora da
Anthropic).

O que precisa ter na máquina: o Claude Code e o `git` (no Mac, se o terminal pedir pra
instalar as Ferramentas de Linha de Comando, é só aceitar). Não precisa de conta no GitHub.

## Plugins

### rea

Engenharia reversa de app, binário, pacote, Electron, Android e página web, do projeto
[morluto/rea](https://github.com/morluto/rea) (licença MIT). O plugin traz tudo junto: a
skill `reverse-engineer-anything` (o método), o servidor MCP do REA (as 207 ferramentas) e
o lançador `bin/rea-mcp`, que resolve o Node sozinho.

**Não precisa instalar Node.** O lançador usa o Node da máquina se ele servir (22.19+,
24.11+ ou 26+); se não, baixa um Node 24 privado na pasta de dados do plugin, conferido pelo
SHA-256 do nodejs.org, sem pedir senha e sem mexer em nada que já esteja instalado. Funciona
no Mac e no Linux; no Windows, instale o Node 24 em https://nodejs.org antes.

**A primeira vez leva uns 2 minutos.** Na primeira sessão depois de instalar, o plugin se
prepara em segundo plano (Node, se faltar, e o pacote do REA). Se as ferramentas do REA não
aparecerem logo, é só reconectar em `/mcp` quando terminar; o registro fica em
`~/.claude/plugins/data/rea-yagosiman/preparar-*.log`. Daí em diante liga em 1 a 2 segundos.

Ferramentas que dependem de motor externo (Hopper, Ghidra, JADX, Frida no celular) avisam
quando faltar; a análise estática de JavaScript roda sem nenhum.

Uso responsável: só em software próprio ou com autorização. Ver
`plugins/rea/DISCLAIMER.md`.

## A nossa cópia das skills de fora

Skill que vem de outro repositório fica guardada aqui inteira, pra continuar existindo se o
autor mudar ou apagar a dele, com a origem anotada em `plugins/<nome>/UPSTREAM.md`.

- **REA:** toda segunda a Action `Espelho do REA` confere o npm e, se saiu versão nova, abre
  um PR com a diferença. Nada entra sem revisão, e a versão anterior fica no histórico. Na
  mão: `node scripts/espelhar-rea.mjs` (a mais nova) ou `node scripts/espelhar-rea.mjs 6.5.0`.
- O espelho copia a skill como veio e acrescenta só o bloco "Neste plugin" depois do
  frontmatter. O que for ajuste nosso entra por esse mesmo caminho, pra a atualização do
  autor não apagar.
- O código do programa em si mora no pacote publicado; pra guardar também esse código,
  mantenha um fork do repositório original no GitHub.

## A trava de dado privado

`node scripts/conferir-publico.mjs` procura, em tudo que vai pro Git:

- padrões que nunca são método: chave e token, endereço de banco Supabase, JWT, caminho de
  máquina, e-mail, CPF e telefone;
- nomes de cliente, de pessoa e de projeto privado. A lista não mora no repositório (seria
  publicar os nomes): fica em `.nomes-proibidos`, fora do Git, e no secret `CONFERIR_NOMES`
  da Action. O aviso cita o número da entrada, nunca o nome.

Roda sozinha antes de cada commit (`git config core.hooksPath .githooks`, uma vez por
clone) e em cada push e PR (Action `Conferir o que é público`).

## Pôr uma skill nova

1. `plugins/<nome>/.claude-plugin/plugin.json` com `name`, `version` e `description`.
2. A skill em `plugins/<nome>/skills/<nome-da-skill>/SKILL.md` (e as referências ao lado).
3. Se ela depende de programa local, o `.mcp.json` em `plugins/<nome>/`, no formato
   `{"mcpServers": {...}}`. Programa em Node usa um lançador como o `bin/rea-mcp`, pra
   ninguém precisar instalar nada.
4. Uma entrada em `.claude-plugin/marketplace.json` com `"source": "./plugins/<nome>"`.
5. Se veio de fora: conferir a licença antes de copiar (sem licença que permita, não entra)
   e anotar a origem em `UPSTREAM.md`.
6. Antes do commit: `claude plugin validate --strict .`, `claude plugin validate --strict
   plugins/<nome>` e `node scripts/conferir-publico.mjs`.
