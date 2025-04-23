# Encontre Distribuidores A&P

Este é um aplicativo React construído com Vite e Tailwind CSS para encontrar distribuidores da A&P Cosmética.

## Pré-requisitos

*   Node.js (versão 18 ou superior recomendada)
*   npm, yarn ou pnpm

## Configuração

1.  **Clone o repositório (se aplicável):**
    ```bash
    git clone <url-do-repositorio>
    cd <nome-do-diretorio>
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    # ou
    pnpm install
    ```

3.  **Configure a Chave da API do Google Maps:**
    *   Obtenha uma chave de API do Google Maps Platform: [https://developers.google.com/maps/gmp-get-started](https://developers.google.com/maps/gmp-get-started)
    *   Certifique-se de habilitar as APIs "Maps JavaScript API" e "Places API".
    *   Crie um arquivo chamado `.env` na raiz do projeto.
    *   Adicione sua chave ao arquivo `.env`:
        ```
        VITE_GOOGLE_MAPS_API_KEY=SUA_CHAVE_DE_API_AQUI
        ```
    *   **Importante:** Se você não criar o `.env`, o app tentará usar um placeholder em `index.html` e `SearchSection.jsx`, o que provavelmente não funcionará. **Não versione (commit) o arquivo `.env` com sua chave.** O arquivo `.gitignore` já está configurado para ignorá-lo.

4.  **Adicione as Imagens:**
    *   Substitua os arquivos placeholder em `src/assets/` pelas suas imagens reais:
        *   `logo-ap.png` (Logo da empresa)
        *   `hero-image.jpg` (Imagem principal da seção Hero)
        *   `info-image.jpg` (Imagem da seção "Informativo")
        *   (Opcional) Adicione `imageUrl` aos dados de `sampleDistributors` em `App.jsx` ou substitua o placeholder `ui-avatars.com` em `DistributorCard.jsx` por imagens reais dos distribuidores.

## Rodando o Projeto

1.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    # ou
    yarn dev
    # ou
    pnpm dev
    ```

2.  Abra o navegador no endereço fornecido (geralmente `http://localhost:5173`).

## Próximos Passos (Sugestões)

*   Implementar o componente de Mapa (`GoogleMap` de `@react-google-maps/api`) em `App.jsx` para exibir os marcadores quando `viewMode` for 'map'.
*   Conectar a lógica de filtro por distância (seletor em `SearchSection.jsx`) à exibição dos distribuidores.
*   Substituir os `sampleDistributors` por uma fonte de dados real (API, backend, etc.).
*   Implementar a geocodificação manual em `SearchSection.jsx` como fallback caso o Autocomplete não retorne coordenadas.
*   Refinar o estilo e a responsividade conforme necessário.
*   Adicionar testes. 