-- Atualiza a coluna de vídeo para armazenar código de incorporação
ALTER TABLE products
DROP COLUMN video_url;

ALTER TABLE products
ADD COLUMN video_embed TEXT;

-- Comentário para a coluna
COMMENT ON COLUMN products.video_embed IS 'Código de incorporação do vídeo do produto (iframe)'; 