# SOVERIGN RM TRACK

Aplicacao web para registro e acompanhamento de performance em exercicios de forca, com foco em rapidez operacional, leitura visual da evolucao e organizacao do historico por usuario.

Video explicativo no YouTube: https://www.youtube.com/watch?v=BRCk91LBTwI

## Visao geral

O SOVERIGN RM TRACK foi pensado para resolver um problema comum em academias, boxes e consultorias: a avaliacao de performance muitas vezes nao entra na rotina porque o processo costuma ser demorado, desorganizado ou burocratico.

Em vez de depender de anotacoes soltas ou planilhas pouco praticas, o app centraliza o registro de cargas, repeticoes e estimativa de 1RM em uma interface simples, responsiva e facil de usar.

## Problema que o projeto resolve

Sem historico estruturado, fica dificil responder perguntas basicas como:

- o aluno realmente evoluiu ou so treinou sem referencia clara
- qual foi o melhor PR por exercicio
- quanto a carga subiu entre duas avaliacoes
- qual percentual de trabalho usar a partir do 1RM atual

O projeto transforma esse acompanhamento em um fluxo curto e objetivo, capaz de ser incorporado a rotina sem atrito.

## Solucao proposta

O sistema permite registrar exercicios e cargas em poucos toques, armazenar o historico localmente e apresentar a evolucao de forma legivel para o usuario final.

Entre os pontos centrais da solucao:

- registro rapido de exercicio, carga e repeticoes
- estimativa automatica de 1RM quando o teste nao e feito com 1 repeticao
- agrupamento de historico por exercicio
- comparacao entre primeiro registro, ultimo registro e melhor marca
- painel com destaque de progresso, ranking interno e mural de PRs
- calculadora de percentual de carga a partir do 1RM atual

## Funcionalidades

- cadastro e login com persistencia local
- autenticacao por nome de usuario ou e-mail
- validacao basica de senha no cadastro
- registro de carga e repeticoes por exercicio
- calculo de 1RM direto ou estimado
- historico com data e horario
- visualizacao de progresso por exercicio
- painel com insights e destaques de performance
- slider para sugerir carga por percentual do 1RM

## Stack utilizada

- HTML5
- CSS3
- JavaScript puro
- LocalStorage para persistencia de usuarios e registros
- SessionStorage para controle de sessao

## Decisoes de implementacao

- Projeto intencionalmente sem framework para demonstrar dominio de base front-end.
- Persistencia local para facilitar testes e uso imediato sem backend.
- Interface reorganizada para priorizar velocidade de registro e leitura de progresso.
- Estrutura em SPA simples, com alternancia entre login, cadastro e painel principal.

## Resultado de produto

O app entrega um fluxo enxuto para registrar performance e deixa a evolucao visivel com mais contexto do que uma anotacao isolada. Isso melhora a comunicacao de resultado, ajuda na prescricao de carga e reduz a friccao operacional do acompanhamento.

## Como executar localmente

1. Clone o repositorio.
2. Abra a pasta do projeto.
3. Execute o arquivo index.html no navegador.

## Estrutura do projeto

- index.html: estrutura principal da interface
- style.css: identidade visual, responsividade e layout
- script.js: autenticacao local, regras de negocio e renderizacao do painel
- README.md: documentacao do projeto

## Melhorias futuras

- edicao e exclusao de registros
- filtros por periodo e por exercicio
- exportacao de relatorios
- graficos comparativos mais detalhados
- sincronizacao com backend
- suporte a multiusuario profissional

## Portfolio

Esse projeto demonstra:

- construcao de interface web responsiva sem framework
- manipulacao de DOM com JavaScript puro
- organizacao de fluxo de autenticacao local
- modelagem de dados simples para historico de performance
- transformacao de um problema operacional em produto digital util
