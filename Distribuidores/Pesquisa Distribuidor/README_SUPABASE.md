# Configuração do Supabase para o Projeto Distribuidores

Este projeto está conectado ao Supabase (https://xtdozoxsbvbitspkuaek.supabase.co) para gerenciar os dados dos distribuidores.

## Estrutura de integração

- `src/supabaseClient.js` - Configuração do cliente Supabase
- `src/services/distribuidoresService.js` - Funções para interagir com os dados dos distribuidores

## Como funciona a conexão

A aplicação se conecta ao Supabase e recupera os dados da tabela `distribuidores`. Os IDs originais do Supabase são mantidos para garantir a compatibilidade com a API existente.

## Funções disponíveis

- `getDistribuidores()` - Busca todos os distribuidores
- `getDistribuidorPorId(id)` - Busca um distribuidor específico por ID
- `adicionarDistribuidor(distribuidor)` - Adiciona um novo distribuidor
- `atualizarDistribuidor(id, dadosAtualizados)` - Atualiza os dados de um distribuidor existente
- `excluirDistribuidor(id)` - Remove um distribuidor

## Estrutura dos dados

A tabela `distribuidores` contém os seguintes campos:

- `id` - Identificador único do distribuidor (mantido do Supabase)
- `name` - Nome do distribuidor
- `phone` - Número de telefone
- `instagram` - Handle do Instagram (com @)
- `address` - Endereço completo
- `lat` - Latitude
- `lng` - Longitude
- `distance` - Distância em formato texto (ex: "42km")
- `verified` - Se o distribuidor é verificado
- `type` - Tipo de distribuidor (Business, Master, Pro, Start, Junior)
- `created_at` - Data de criação do registro

## Manutenção

Para ajustes futuros na estrutura do banco, consulte o arquivo `create_supabase_table.sql`, que contém a estrutura da tabela como referência. **Não execute este script diretamente**, pois já existem dados no Supabase. 