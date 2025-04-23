-- Script para corrigir as permissões de acesso à tabela de distribuidores
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se o RLS (Row Level Security) está habilitado
-- e em caso positivo, vamos reaplicar a política de acesso anônimo

-- Verificar se o RLS está ativado para a tabela distribuidores
SELECT 
  tablename, 
  rowsecurity 
FROM 
  pg_tables 
WHERE 
  schemaname = 'public' 
  AND tablename = 'distribuidores';

-- Desativar o RLS (caso esteja causando problemas)
-- ALTER TABLE distribuidores DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (caso estejam configuradas incorretamente)
DROP POLICY IF EXISTS "Permitir leitura anônima de distribuidores" ON distribuidores;

-- Ativar o RLS novamente
ALTER TABLE distribuidores ENABLE ROW LEVEL SECURITY;

-- Criar uma nova política que permita acesso de leitura PARA TODOS os usuários
CREATE POLICY "Permitir leitura anônima de distribuidores" 
  ON distribuidores FOR SELECT 
  USING (true);
  
-- Criar uma política que permita inserção por usuários autenticados
CREATE POLICY "Permitir inserção por usuários autenticados" 
  ON distribuidores FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
  
-- Criar uma política que permita atualização por usuários autenticados
CREATE POLICY "Permitir atualização por usuários autenticados" 
  ON distribuidores FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Verificar as políticas após criá-las
SELECT * FROM pg_policies WHERE tablename = 'distribuidores';

-- Nota: Se ainda houver problemas após executar este script, pode ser necessário
-- verificar as configurações de autenticação anônima no projeto Supabase
-- ou verificar se há outras restrições em nível de banco de dados. 