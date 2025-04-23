-- Adiciona coluna de vídeo na tabela products
ALTER TABLE products
ADD COLUMN video_url TEXT;

-- Comentário para a coluna
COMMENT ON COLUMN products.video_url IS 'URL do vídeo do produto'; 