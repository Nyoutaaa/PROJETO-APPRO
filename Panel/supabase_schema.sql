-- Esquema de Banco de Dados para o Admin Panel
-- Este script cria todas as tabelas necessárias para o sistema no Supabase

-- Extensão uuid-ossp para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários (estende a auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    company TEXT,
    role TEXT DEFAULT 'Colaborador' CHECK (role IN ('Colaborador', 'Administrador')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tipos
CREATE TABLE IF NOT EXISTS public.tipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, category_id)
);

-- Adicionar a restrição de chave estrangeira em uma instrução separada
ALTER TABLE public.tipos 
ADD CONSTRAINT tipos_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE CHECK (name IN ('Starter', 'Pro', 'Master', 'Business')),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    background_color TEXT NOT NULL,
    text_color TEXT NOT NULL,
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Distribuidores
DROP TABLE IF EXISTS public.distribuidores CASCADE;
CREATE TABLE IF NOT EXISTS public.distribuidores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    cidade TEXT,
    estado TEXT,
    instagram TEXT,
    status TEXT CHECK (status IN ('Ativo', 'Inativo', 'Pendente')),
    plan_id UUID,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar a restrição de chave estrangeira para distribuidores (se não existir)
-- ALTER TABLE public.distribuidores DROP CONSTRAINT IF EXISTS distribuidores_plan_id_fkey;
ALTER TABLE public.distribuidores
ADD CONSTRAINT distribuidores_plan_id_fkey
FOREIGN KEY (plan_id) REFERENCES public.plans(id);

-- Tabela de Parceiros
DROP TABLE IF EXISTS public.parceiros CASCADE;
CREATE TABLE IF NOT EXISTS public.parceiros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    cidade TEXT,
    estado TEXT,
    status TEXT CHECK (status IN ('Ativo', 'Inativo', 'Pendente')),
    instagram TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subtitle TEXT,
    mini_description TEXT,
    description TEXT,
    real_price DECIMAL(10, 2) NOT NULL,
    promo_price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2),
    sku TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
    category_id UUID,
    tipo_id UUID,
    video_embed TEXT,
    button_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar as restrições de chave estrangeira em instruções separadas
ALTER TABLE public.products 
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.products 
ADD CONSTRAINT products_tipo_id_fkey 
FOREIGN KEY (tipo_id) REFERENCES public.tipos(id);

-- Tabela de Imagens dos Produtos
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar a restrição de chave estrangeira em uma instrução separada
ALTER TABLE public.product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Dados iniciais para planos
INSERT INTO public.plans (name, description, price, background_color, text_color, features)
VALUES 
('Starter', 'Plano inicial para pequenos negócios', 99.90, '#FFFFFF', '#000000', '["Até 10 produtos", "Suporte básico", "1 usuário"]'),
('Pro', 'Plano ideal para negócios em crescimento', 199.90, '#666666', '#FFFFFF', '["Até 50 produtos", "Suporte prioritário", "3 usuários", "Relatórios básicos"]'),
('Master', 'Plano para empresas estabelecidas', 299.90, '#FF0000', '#FFFFFF', '["Produtos ilimitados", "Suporte premium", "5 usuários", "Relatórios avançados"]'),
('Business', 'Plano premium para grandes empresas', 499.90, '#000000', '#FFFFFF', '["Produtos ilimitados", "Suporte VIP 24/7", "Usuários ilimitados", "API completa", "Relatórios customizados"]');

-- Criação de Functions e Triggers para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicando trigger em todas as tabelas principais
CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tipos
BEFORE UPDATE ON public.tipos
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_plans
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_distribuidores
BEFORE UPDATE ON public.distribuidores
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_parceiros
BEFORE UPDATE ON public.parceiros
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_product_images
BEFORE UPDATE ON public.product_images
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Configuração de permissões do Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribuidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores
CREATE POLICY "Administradores têm acesso completo" ON public.profiles
FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'Administrador'));

-- Política para colaboradores
CREATE POLICY "Colaboradores têm acesso de leitura" ON public.profiles
FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'Colaborador'));

-- Política para usuários acessarem seu próprio perfil
CREATE POLICY "Usuários podem visualizar e editar seu próprio perfil" ON public.profiles
FOR ALL USING (auth.uid() = id);

-- Políticas para a tabela categories
CREATE POLICY "Permitir acesso completo para usuários autenticados" ON public.categories
FOR ALL -- Aplica-se a SELECT, INSERT, UPDATE, DELETE
USING (auth.role() = 'authenticated') -- Permite a operação se o usuário estiver autenticado
WITH CHECK (auth.role() = 'authenticated'); -- Garante que novas linhas também atendam à condição

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS tipos_category_id_idx ON public.tipos(category_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_tipo_id_idx ON public.products(tipo_id);
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);

-- Aplicando triggers (se foram dropados pelo CASCADE)
DROP TRIGGER IF EXISTS set_timestamp_distribuidores ON public.distribuidores;
CREATE TRIGGER set_timestamp_distribuidores BEFORE UPDATE ON public.distribuidores FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_parceiros ON public.parceiros;
CREATE TRIGGER set_timestamp_parceiros BEFORE UPDATE ON public.parceiros FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Configuração de RLS (se foram dropados pelo CASCADE)
ALTER TABLE public.distribuidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para distribuidores (recriar se dropado)
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados em distribuidores" ON public.distribuidores;
CREATE POLICY "Permitir acesso completo para usuários autenticados em distribuidores" ON public.distribuidores
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Políticas RLS para parceiros (recriar se dropado)
DROP POLICY IF EXISTS "Permitir acesso completo para usuários autenticados em parceiros" ON public.parceiros;
CREATE POLICY "Permitir acesso completo para usuários autenticados em parceiros" ON public.parceiros
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Índices (recriar se dropado)
-- Removido índice de parceiros_distribuidor_id
-- CREATE INDEX IF NOT EXISTS parceiros_distribuidor_id_idx ON public.parceiros(distribuidor_id);

-- Remover Tabela Tipos (já estava no script anterior, mas garantir)
DROP TABLE IF EXISTS public.tipos CASCADE; 