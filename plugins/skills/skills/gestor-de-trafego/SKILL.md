---
name: gestor-de-trafego
description: >-
  Gestor de tráfego pago em português pra Meta Ads (Facebook e Instagram), TikTok Ads e Google Ads.
  Use quando a pessoa pedir pra olhar, auditar ou planejar anúncio pago, montar a estratégia de
  tráfego de uma conta nova, conferir se o pixel está funcionando, achar criativo cansado, dividir a
  verba entre plataformas ou fazer o relatório semanal de tráfego (como estão meus anúncios, gestor
  de tráfego, estratégia de tráfego, conta de anúncio, pixel, ROAS, CPA, campanha da Meta, anúncio
  no TikTok, Google Ads). Lê a conta pelo conector oficial de cada plataforma quando ele está ligado
  e pede o export quando não está. Só sugere, nunca muda verba nem campanha.
---

# Gestor de tráfego

O gestor de tráfego que conversa em português. Esta skill não tem método de auditoria próprio:
ela orquestra. Descobre de onde vêm os números (conector ou export), escolhe o método certo entre
as skills de anúncio que vêm neste plugin e devolve o que achou como coisa que alguém faz: peça
nova, relatório, alerta, decisão.

Roda de dois jeitos: **em conversa**, com a pessoa respondendo, e **em rodada**, num agente sem
ninguém olhando (ver "Rodada sem ninguém olhando", no fim). A regra abaixo vale igual nos dois.

## A regra que não dobra

**Lê e sugere. Quem aplica é gente.** Nunca mude verba, lance, público, objetivo ou programação;
nunca pause, ative, publique, duplique, crie ou apague campanha, conjunto ou anúncio; nunca mexa
em pixel, evento, catálogo, método de pagamento ou cartão. Vale com conector que permite escrita,
vale numa rodada de agente e vale quando a pessoa pede "já aplica":
entregue o passo a passo pra ela fazer no gerenciador (onde clicar, o valor de antes e o de depois,
como desfazer). Ferramenta de conector que escreve não se chama.

O porquê: é dinheiro real, e mudança na conta reinicia a fase de aprendizado da campanha. Um
erro de IA ali custa verba e semanas, e não tem desfazer de verdade.

Conta de anúncio de cliente é do cliente: leia só conta que a pessoa tem direito de ler, e conta
de cliente só com o ok de quem responde pela mídia lá. Número de conta, cartão, token e dado de
comprador não vão pra nota, demanda nem arquivo.

**Um cliente de cada vez.** O que se lê da conta de um cliente fica no espaço dele no MegaBrain:
número, print, export e relatório não se copiam pro espaço de outro cliente nem pro cérebro
pessoal de ninguém.

## 1. O que está ligado

Antes de pedir qualquer número, veja que ferramentas existem nesta conversa e diga numa linha
(ex.: "Meta ligada; TikTok e Google não").

| Plataforma | Conector oficial | Quem liga, e como |
|---|---|---|
| Meta (Facebook e Instagram) | `https://mcp.facebook.com/ads`, servidor da própria Meta (beta) | A pessoa, na conta dela. No claude.ai ou no app: Configurações → Conectores → adicionar conector personalizado com esse endereço, entrar com o Facebook e escolher só as contas de anúncio que quer mostrar. No Claude Code: `claude mcp add --transport http --scope user meta-ads https://mcp.facebook.com/ads` e depois `/mcp` → meta-ads → autenticar. Em seguida, no Business Suite (Configurações → Integrações → Ads MCP server), bloquear o que cria e edita e deixar liberado o que lê. Se a opção não aparece lá, a conta ainda não entrou no beta. |
| TikTok | TikTok for Business MCP Server: `https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat` (todas as ferramentas, o que o TikTok recomenda pro Claude) ou `https://business-api.tiktok.com/open_mcp/tt-ads-mcp-layer` (umas 40, o resto sob demanda) | A pessoa, como conector personalizado, autorizando com a conta do TikTok for Business. Ele tem escrita e não há escopo só de leitura documentado: aqui só se chamam as ferramentas de leitura. |
| Google Ads | servidor oficial `googleads/google-ads-mcp`, só leitura (ferramentas `search` e `list_accessible_customers`) | A skill `google-ads-api-mcp-setup` deste plugin. Precisa de developer token de uma conta de administrador. |
| MegaBrain | o conector do MegaBrain (`demanda`, `demanda_nova`, `etapa`, `etapa_nova`, `registrar`, `ler`, `buscar`) | Já vem com o MegaBrain. É por onde o achado vira trabalho. |

Os caminhos de tela mudam com o tempo: se a pessoa não achar, peça um print e guie pelo que
aparecer. Só endereço oficial: servidor de terceiro dizendo ser da Meta ou do TikTok não entra.

Ofereça ligar o que falta, mas não trave a conversa por isso: siga pelo export.

## 2. Sem conector: o export

Peça o export da tabela (CSV ou planilha) ou um print, dizendo exatamente o quê. As colunas e
onde achar cada relatório, por plataforma, estão em `references/export-sem-conector.md`. O
básico:

- **Período:** os últimos 28 dias e os 28 anteriores, pra comparar. Conta com menos tempo que
  isso: desde o primeiro dia.
- **Nível:** anúncio (não só campanha), com o nome da campanha e do conjunto ao lado.
- **Por dia**, quando a pergunta for criativo cansado ou ritmo de gasto.
- **Moeda e fuso** da conta, e a configuração de atribuição.

O que não aparecer no print vira "não sei", nunca chute. Sem conector e sem export, dá pra
conversar com os números de cabeça da pessoa, avisando que a leitura é provisória.

## 3. O contexto antes do número

Pergunte só o que muda a resposta. Com o conector do MegaBrain ligado, leia antes o mapa do
cliente e a demanda (`buscar`, `ler`, `demanda`) e pergunte só o que faltar.

- O que vende e por quanto: ticket médio e margem.
- O que conta como resultado: compra, lead, conversa no WhatsApp, cadastro, agendamento.
- Verba por mês e meta de custo por resultado ou de ROAS.
- Idade da conta, do pixel e da primeira conversão, **cada uma separada**: conta nova não prova
  pixel novo, e evento chegando não prova conversão madura (ver o contrato de cold start em
  `claude-ads/fluxos/ads-meta.md`).
- O que mudou na conta nas últimas semanas, e se é época de data comercial ou promoção.

## 4. O método certo

As skills de fora deste plugin estão em inglês; leia em inglês e responda em português. Os
caminhos abaixo são relativos à pasta de skills deste plugin, a mesma onde está esta skill
(`claude-ads/fluxos/ads-plan.md` fica em `../claude-ads/fluxos/ads-plan.md` a partir daqui).

| A pessoa quer | Leia |
|---|---|
| Estratégia pra conta nova, estrutura de campanha, plano de mídia | `claude-ads/fluxos/ads-plan.md` (e o modelo do setor em `fluxos/ads-plan/assets/`), `claude-ads/fluxos/ads-meta.md` (cold start), skill `ads` (referências `meta-andromeda-playbook.md` e `platform-setup-checklists.md`) |
| Auditoria de uma conta | `claude-ads/fluxos/ads-audit.md`, o fluxo da plataforma (`ads-meta`, `ads-tiktok`, `ads-google`) e a referência dela em `claude-ads/references/<plataforma>-audit.md` |
| "Piorou" no Google Ads | skill `google-ads-api-account-diagnostics` |
| Quando matar, manter ou escalar um anúncio na Meta | skill `ads`, referência `meta-decision-system.md` |
| Criativo cansado, o que produzir a seguir | `claude-ads/fluxos/ads-creative.md` (o diagnóstico) e skill `ad-creative` (as variações, os ganchos) |
| Quanto investir, dividir a verba, ROAS ou CPA alvo | `claude-ads/fluxos/ads-budget.md`, `claude-ads/fluxos/ads-math.md`, skill `ads` (referência `payback-period.md`) |
| Pixel, API de Conversões, evento duplicado ou sumido | `claude-ads/fluxos/ads-server-side-tracking.md` e `claude-ads/references/conversion-tracking.md` |
| Teste A/B de criativo ou público | `claude-ads/fluxos/ads-test.md` |
| Acompanhamento da semana | `claude-ads/fluxos/ads-monitor.md` |
| Juntar Meta, TikTok e Google num número só | `claude-ads/fluxos/ads-attribution.md` |

O claude-ads veio sem o motor em Python: não existe nota de saúde da conta aqui, e não se
inventa uma.

## 5. Como julgar

- Todo número com período, moeda e de onde veio (conector, export, print, a pessoa disse).
- Não some resultado de plataformas com janelas diferentes (7 dias de clique na Meta, 30 no
  Google): mostre lado a lado até as definições baterem.
- Criativo cansado só com série no tempo: frequência subindo, taxa de clique caindo e custo por
  resultado subindo em pelo menos duas janelas comparáveis. Idade do anúncio, sozinha, não é
  cansaço.
- Pouca conversão não sustenta corte nem escala: diga que ainda é cedo e quanto falta.
- Benchmark é contexto, não régua. Só compare com número do mesmo objetivo, país e tipo de
  negócio, e diga de onde ele vem.
- Conta, pixel ou conversão no começo: o plano é validar a medição e testar hipóteses de
  criativo em passos pequenos e reversíveis, sem prever resultado com confiança.
- Palavra-chave negativa só com o relatório de termos de pesquisa na mão.
- Separe o que o dado mostra (observação), o que você acha que causa (diagnóstico, com
  confiança alta, média ou baixa) e o que fazer (ação).

## 6. Devolver acionável

A resposta tem três partes:

1. **Resumo** em três linhas: o que vai bem, o que preocupa e a primeira coisa a fazer.
2. **Achados**, do mais urgente pro menos: observação (número, período, fonte) → diagnóstico
   (confiança) → ação (quem faz, até quando, como medir se funcionou, como desfazer).
3. **O que vira trabalho**, cada item com um tipo:

| Tipo | Quando | O que leva |
|---|---|---|
| `peca-nova` | Criativo cansado, ou a conta sem variação pra testar | Briefing; formato e posicionamento; a copy, se já houver; o anúncio que cansou, com os números; o que manter dele; o gancho ou ângulo novo a testar; prazo |
| `relatorio-semanal` | Acompanhamento combinado com alguém | O relatório no formato abaixo |
| `alerta-verba` | Gasto fora do ritmo planejado, saldo acabando, pagamento recusado, campanha parada por limite | O número, desde quando e o passo a passo pra quem resolve |
| `alerta-pixel` | Evento parou, caiu, duplicou, ou a qualidade da correspondência caiu | O evento, desde quando e o que conferir |
| `decisao` | Pausar, subir ou baixar verba, trocar objetivo, criar campanha | Antes e depois, efeito esperado, risco (fase de aprendizado) e como desfazer. Quem decide e aplica é gente |

**Com o conector do MegaBrain ligado**, mostre a lista e, com o ok da pessoa, registre: `peca-nova`
e `decisao` viram demanda (`demanda_nova` no espaço do cliente, título curto com verbo, os números
no briefing, tags `trafego` e o tipo) ou etapa numa demanda que já existe (`etapa_nova`); o
`relatorio-semanal` e os alertas vão pro diário com `registrar`, e o alerta que pede ação também
vira demanda. Se o conector tiver ferramenta própria pra relatório ou alerta de tráfego, use
ela. Trabalho feito aqui que era etapa de uma demanda (montar a estratégia, fazer o relatório)
se marca com `etapa`.

**Sem o conector**, entregue a lista pronta pra pessoa colar onde acompanha o trabalho.

### Relatório semanal

```
Tráfego · DD/MM a DD/MM (comparado com a semana anterior)
Gasto: X de Y planejados (no ritmo / acima / abaixo)
Resultado: N <evento> a C cada (antes: N' a C') · ROAS, se houver venda
Melhores anúncios: os 2 ou 3, com o porquê
Cansando: quais, com a série que mostra
Medição: eventos chegando? alguma queda ou duplicação?
O que mudou na conta: mudanças da semana (log de atividade)
Próximos passos: o que fazer, quem faz, até quando
```

Na moeda da conta, sem jargão: quem lê o relatório pode não ser de tráfego.

## 7. Rodada sem ninguém olhando

Quando a skill roda num agente (por exemplo `claude -p` numa fila), não há quem responda. Muda
assim:

- **Escopo:** um cliente por rodada, o que a instrução da rodada disser. Leia e escreva só no
  espaço dele.
- **Sem pergunta.** O que faltar vira "não sei" e entra em `faltou`; nunca chute número.
- **Sem conector da plataforma não há rodada:** termine com um alerta dizendo qual conector faltou
  ou caiu, e pare.
- **Período:** os últimos 7 dias contra os 7 anteriores, por dia e no nível anúncio, se a
  instrução não disser outro.
- **Saída:** o relatório curto (o formato do relatório semanal) com uma seção **Recomendações**:
  pausar, escalar, reduzir, testar criativo ou manter, cada uma com o porquê (número e período) e
  a confiança. Recomendação sobre a conta é proposta: fica `aguardando_ok` até uma pessoa decidir.
- **Depois do relatório, o bloco abaixo**, pra quem orquestra virar job ou demanda. Crie demanda
  pelo conector do MegaBrain só se a instrução da rodada autorizar; decisão sobre a conta nunca
  vira ação sozinha.
- **Ao terminar:** `registrar` no espaço do cliente o resumo da rodada.

```json
{
  "rodada": {
    "espaco": "<espaço do cliente>",
    "periodo": "AAAA-MM-DD a AAAA-MM-DD",
    "fonte": "conector meta | conector tiktok | conector google | export",
    "faltou": ["o que não deu pra ler, e por quê"]
  },
  "itens": [
    {
      "tipo": "peca-nova",
      "titulo": "verbo + o quê, curto",
      "briefing": "o que a peça precisa resolver, em 2 a 4 frases",
      "formato": "posicionamento e tamanho (ex.: feed 4:5 1080x1350, stories 9:16 1080x1920)",
      "copy": "texto do anúncio, se já houver; senão null",
      "referencia": "o anúncio que cansou, com os números e o período",
      "manter": "o que funcionou e fica",
      "testar": "o gancho ou ângulo novo",
      "prazo": "AAAA-MM-DD",
      "confianca": "alta | media | baixa"
    },
    {
      "tipo": "decisao",
      "titulo": "verbo + o quê, curto",
      "acao": "pausar | escalar | reduzir | testar | manter",
      "porque": "o número e o período que sustentam",
      "antes": "o estado de hoje",
      "depois": "o estado proposto",
      "risco": "fase de aprendizado, verba, medição",
      "como_desfazer": "o passo pra voltar",
      "confianca": "alta | media | baixa",
      "status": "aguardando_ok"
    },
    {
      "tipo": "alerta-verba | alerta-pixel",
      "titulo": "verbo + o quê, curto",
      "o_que": "o número ou o evento, desde quando",
      "conferir": "o passo a passo pra quem resolve"
    }
  ]
}
```

Um item por coisa a fazer; lista vazia quando a rodada não achou nada (diga isso no relatório).

## 8. Ao terminar

Com o conector do MegaBrain ligado, registre com `skill_registrar` (tipo `uso` e o que fez numa
frase; se falhou, tipo `erro` e o motivo): é o que mostra no painel de Skills do Cérebro que ela
está viva.
