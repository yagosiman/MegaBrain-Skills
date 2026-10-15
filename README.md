# MegaBrain-Skills

As skills compartilhadas do MegaBrain num plugin só, o `skills`. Instala uma vez e pronto:
toda skill que entrar aqui depois chega sozinha pra quem instalou, na sessão seguinte.

**Este repositório é público.** Aqui só entra método que qualquer pessoa pode ler: nada de
dado de quem usa o MegaBrain, nome de cliente ou de pessoa, conversa, chave, endereço de
banco ou caminho de máquina. A trava (`scripts/conferir-publico.mjs`) barra isso no commit e
no GitHub.

**O nome é de vitrine.** "MegaBrain" aparece só em texto (este README e as descrições).
Nada que alguém digita ou que fica instalado carrega o nome: o plugin é `skills@yagosiman` e
os arquivos ficam na pasta de dados do plugin. Trocar o nome do produto é trocar esse texto
e, se quiser, renomear o repositório (o GitHub redireciona o endereço antigo).

## Instalar

Cola isto pro próprio Claude Code e deixa ele fazer:

> Instala as skills do MegaBrain: roda `claude plugin marketplace add yagosiman/MegaBrain-Skills`
> e depois `claude plugin install skills@yagosiman`. Depois liga a atualização automática
> desse marketplace: no meu `~/.claude/settings.json`, em `extraKnownMarketplaces.yagosiman`,
> põe `"autoUpdate": true` sem mexer no resto. Quando terminar, me avisa pra reiniciar.

Depois, reinicia o Claude Code. É só isso.

Se preferir fazer na mão, são os mesmos passos: `/plugin marketplace add
yagosiman/MegaBrain-Skills`, `/plugin install skills@yagosiman` e, em `/plugin` →
Marketplaces → yagosiman, ligar a atualização automática.

**Por que a atualização automática é um passo.** O Claude Code deixa ela desligada pra
marketplace de fora da Anthropic, e quem liga é a pessoa, nas configurações dela; o plugin
não pode ligar sozinho. Com ela ligada, o Claude Code confere este repositório nas sessões e
traz o que mudou; o que chegou vale a partir da sessão seguinte (ou na hora, com
`/reload-plugins`). Sem ela, a pessoa atualiza com `/plugin` → Marketplaces → Update.

O que precisa ter na máquina: o Claude Code e o `git` (no Mac, se o terminal pedir pra
instalar as Ferramentas de Linha de Comando, é só aceitar). Não precisa de conta no GitHub.

## O que vem no plugin

### reverse-engineer-anything (REA)

Engenharia reversa de app, binário, pacote, Electron, Android e página web, do projeto
[morluto/rea](https://github.com/morluto/rea) (licença MIT, em `plugins/skills/origens/rea/`).
Vem a skill (o método), o servidor MCP do REA (as 207 ferramentas) e o lançador
`bin/rea-mcp`, que resolve o Node sozinho.

**Não precisa instalar Node.** O lançador usa o Node da máquina se ele servir (22.19+,
24.11+ ou 26+); se não, baixa um Node 24 privado na pasta de dados do plugin, conferido pelo
SHA-256 do nodejs.org, sem pedir senha e sem mexer em nada que já esteja instalado. Funciona
no Mac e no Linux; no Windows, instale o Node 24 em https://nodejs.org antes.

**A primeira vez leva uns 2 minutos.** Na primeira sessão depois de instalar, o plugin se
prepara em segundo plano (Node, se faltar, e o pacote do REA). Se as ferramentas do REA não
aparecerem logo, é só reconectar em `/mcp` quando terminar; o registro fica em
`~/.claude/plugins/data/skills-yagosiman/preparar-*.log`. Daí em diante liga em 1 a 2 segundos.

Ferramentas que dependem de motor externo (Hopper, Ghidra, JADX, Frida no celular) avisam
quando faltar; a análise estática de JavaScript roda sem nenhum.

Uso responsável: só em software próprio ou com autorização. Ver
`plugins/skills/origens/rea/DISCLAIMER.md`.

## A nossa cópia das skills de fora

Skill que vem de outro repositório fica guardada aqui inteira, pra continuar existindo se o
autor mudar ou apagar a dele, com a origem e a licença em `plugins/skills/origens/<nome>/`.

- **REA:** toda segunda a Action `Espelho do REA` confere o npm e, se saiu versão nova, abre
  um PR com a diferença. Nada entra sem revisão, e a versão anterior fica no histórico. Na
  mão: `node scripts/espelhar-rea.mjs` (a mais nova) ou `node scripts/espelhar-rea.mjs 6.5.0`.
- O espelho copia a skill como veio e acrescenta só o bloco "Neste plugin" depois do
  frontmatter. O que for ajuste nosso entra por esse mesmo caminho, pra a atualização do
  autor não apagar.
- O programa em si também fica guardado aqui, sem fork: cada versão vira um Release
  `rea-<versão>` com o pacote publicado anexado (Action `Guardar o pacote do REA`).

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

1. Uma pasta em `plugins/skills/skills/<nome-da-skill>/` com o `SKILL.md` (e as referências
   ao lado). Só isso: não tem número de versão pra subir, cada commit já é a atualização.
2. Se ela depende de programa local, o servidor entra no `plugins/skills/.mcp.json` (formato
   `{"mcpServers": {...}}`). Programa em Node usa um lançador como o `bin/rea-mcp`, pra
   ninguém precisar instalar nada.
3. Se veio de fora: conferir a licença antes de copiar (sem licença que permita, não entra)
   e anotar origem e licença em `plugins/skills/origens/<nome>/`.
4. Antes do commit: `claude plugin validate .`, `claude plugin validate
   plugins/skills` e `node scripts/conferir-publico.mjs`. Sem `--strict`: o único aviso dele é
   a falta de `version`, que é de propósito.
