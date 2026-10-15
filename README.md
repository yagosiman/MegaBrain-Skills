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

### Google Ads (3 skills do google/skills)

Três skills oficiais do time da API do Google Ads, do repositório
[google/skills](https://github.com/google/skills) (licença Apache-2.0, em
`plugins/skills/origens/google-ads/`). Das 14 de anúncios que o Google publicou, só estas
servem a quem roda campanha; as outras são de SDK de app (AdMob, IMA) e de subir dado pela
Data Manager API.

- `google-ads-api-account-diagnostics`: o diagnóstico da conta. Conversão ou valor caindo,
  lead sumindo, impressão perdida por verba ou por classificação, upload offline falhando.
- `google-ads-api-mcp-setup`: liga o servidor MCP oficial
  ([googleads/google-ads-mcp](https://github.com/googleads/google-ads-mcp)), que só lê a conta.
- `google-ads-api-quickstart`: a credencial da API e o primeiro script; resolve
  `DEVELOPER_TOKEN_NOT_APPROVED` e afins.

**O servidor não vem no plugin**, de propósito: ele liga com a credencial de cada pessoa
(developer token de uma conta de administrador e OAuth do Google Cloud), e credencial não mora
em repositório público. Quem quiser ler a conta ao vivo liga o seu com a skill de MCP, no
escopo do usuário (`claude mcp add --scope user`). Sem ele o diagnóstico funciona do mesmo
jeito, pelos relatórios da interface do Google Ads: a skill diz o que abrir e lê o resultado
junto.

## A nossa cópia das skills de fora

Skill que vem de outro repositório fica guardada aqui inteira, pra continuar existindo se o
autor mudar ou apagar a dele, com a origem e a licença em `plugins/skills/origens/<nome>/`.

- **REA:** toda segunda a Action `Espelho do REA` confere o npm e, se saiu versão nova, abre
  um PR com a diferença. Nada entra sem revisão, e a versão anterior fica no histórico. Na
  mão: `node scripts/espelhar-rea.mjs` (a mais nova) ou `node scripts/espelhar-rea.mjs 6.5.0`.
- **Google Ads:** toda segunda a Action `Espelho do Google Ads` confere o google/skills e, se
  alguma das três skills mudou, abre um PR com a diferença. Na mão:
  `node scripts/espelhar-google-ads.mjs` (o main de hoje) ou com um commit exato.
- O espelho copia a skill como veio e acrescenta só o gatilho em português no fim da
  `description` e o bloco "Neste plugin" depois do frontmatter. O que for ajuste nosso entra
  por esse mesmo caminho, pra a atualização do autor não apagar.
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
   ao lado). Não tem número de versão pra subir, cada commit já é a atualização. A
   `description` do `SKILL.md` é o gatilho: a skill liga sozinha quando o pedido bate com
   ela, então escreva ali, com as palavras de quem pede, quando ela serve.
2. Uma linha no `catalogo.json` (nome, o que faz numa frase, quando usar, cor e ícone): é o
   que o painel de Skills do Cérebro e o conector mostram. O gancho de commit
   (`scripts/conferir-catalogo.mjs`) barra skill sem linha e linha sem skill.
3. Se ela depende de programa local, o servidor entra no `plugins/skills/.mcp.json` (formato
   `{"mcpServers": {...}}`). Programa em Node usa um lançador como o `bin/rea-mcp`, pra
   ninguém precisar instalar nada.
4. Se veio de fora: conferir a licença antes de copiar (sem licença que permita, não entra)
   e anotar origem e licença em `plugins/skills/origens/<nome>/`.
5. Antes do commit: `claude plugin validate .`, `claude plugin validate
   plugins/skills`, `node scripts/conferir-publico.mjs` e `node scripts/conferir-catalogo.mjs`.
   Sem `--strict`: o único aviso dele é a falta de `version`, que é de propósito.

## Como se sabe que uma skill está viva

O plugin não tem como avisar ninguém sozinho (ele não guarda chave nenhuma). Quem conta é a
IA, pelo conector do MegaBrain: no começo da conversa ela diz quais `skills:<nome>` tem
instaladas, e ao terminar um trabalho com uma delas registra o uso (ou o erro, com o
motivo) com `skill_registrar`. O painel de Skills, ao lado dos Conectores no Cérebro, junta
isso com o `catalogo.json`: o que existe, quem tem, o último uso e o último erro.
