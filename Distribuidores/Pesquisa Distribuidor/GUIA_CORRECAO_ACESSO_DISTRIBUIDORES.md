# Guia para Corrigir o Acesso aos Distribuidores no Supabase

Este guia explica como corrigir o problema de acesso aos distribuidores no Supabase, permitindo que sejam visualizados sem necessidade de autenticação.

## Problema

A aplicação não está conseguindo visualizar os distribuidores do Supabase. O problema provavelmente está relacionado às políticas de segurança (Row Level Security - RLS) configuradas no banco de dados.

## Solução

1. Acesse o painel do Supabase em https://xtdozoxsbvbitspkuaek.supabase.co
2. Faça login com suas credenciais de administrador
3. No menu lateral, clique em "SQL Editor"
4. Crie um novo script clicando em "New Query"
5. Cole o conteúdo do arquivo `supabase_fix_distribuidor_access.sql` no editor
6. Execute o script clicando em "Run"

## O que o script faz?

O script SQL realiza as seguintes operações:

1. Verifica se o Row Level Security (RLS) está ativado para a tabela de distribuidores
2. Remove políticas existentes que possam estar configuradas incorretamente
3. Reativa o RLS para a tabela
4. Cria uma nova política que permite acesso de leitura para todos os usuários
5. Cria políticas adicionais para controlar inserção e atualização por usuários autenticados
6. Verifica se as políticas foram aplicadas corretamente

## Verificação

Após executar o script, você pode verificar se o problema foi resolvido:

1. Reinicie sua aplicação que acessa os distribuidores
2. Tente visualizar a lista de distribuidores
3. Verifique no console se há algum erro relacionado ao acesso

## Problemas Persistentes

Se o problema persistir após aplicar este script, verifique:

1. Se a conexão com o Supabase está configurada corretamente em `src/supabaseClient.js`
2. Se a chave anônima (`supabaseAnonKey`) é válida e não expirou
3. Se há outras restrições em nível de banco de dados ou autenticação anônima

## Suporte

Se precisar de mais ajuda, consulte a documentação oficial do Supabase sobre Row Level Security:
https://supabase.com/docs/guides/auth/row-level-security 