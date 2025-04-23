import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getProductsByCategory } from "../lib/api";

export default function Categoria() {
  const navigate = useNavigate();
  const { nome } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getProductsByCategory(nome.toLowerCase());
        
        if (data) {
          const produtosFormatados = data.map(p => ({
            nome: p.name,
            nomeSecundario: p.secondary_name,
            subtitulo: p.subtitle,
            imagem: p.images[0],
            slug: p.slug
          }));
          setProdutos(produtosFormatados);
        }
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [nome]);

  const total = produtos.length;

  const next = () => {
    setCurrentIndex((prev) => {
      if (prev >= total - 1) return prev;
      return prev + 1;
    });
  };

  const prev = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return prev;
      return prev - 1;
    });
  };

  const touchStartX = useRef(null);
  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - endX;
    if (diff > 50) next();
    if (diff < -50) prev();
  };

  const getSlides = () => {
    let slides = [];
    for (let i = 0; i < total; i++) {
      slides.push({ ...produtos[i], position: i });
    }
    return slides;
  };

  const nomeFormatado =
    nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const slideIn = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.8 }
  };

  return (
    <div className="w-screen h-screen bg-white text-black font-figtree overflow-hidden relative">
      {/* CONTAINER PRINCIPAL DO HEADER */}
      <motion.div 
        className="relative w-full pt-[clamp(3rem,5vh,4rem)]" 
        style={{ height: "clamp(100px, 12vh, 140px)" }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center w-full h-full px-[8%]">
          {/* LOGO APPRO + BOTÃO VOLTAR */}
          <motion.div 
            className="flex items-center" 
            style={{ gap: "clamp(1.5rem, 2.5vw, 2rem)" }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative" style={{ width: "clamp(90px, 8vw, 120px)" }}>
              <button className="w-full transform transition duration-200 ease-in-out hover:scale-110">
                <img
                  src="/logo appro preta.svg"
                  alt="Logo Appro"
                  className="w-full h-auto"
                />
              </button>
            </div>
            
            <motion.button
              onClick={() => navigate(-1)}
              className="group flex items-center transform transition-all duration-200 ease-in-out hover:scale-110"
              style={{ gap: "clamp(0.3rem, 0.5vw, 0.5rem)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <img 
                src="/seta.svg" 
                alt="Voltar" 
                style={{ width: "clamp(16px, 1.2vw, 20px)", height: "auto" }}
              />
              <span 
                style={{ fontSize: "clamp(0.875rem, 1.2vw, 1rem)" }}
                className="text-black"
              >
                Voltar
              </span>
            </motion.button>
          </motion.div>

          {/* WHATSAPP + SINO */}
          <motion.div 
            className="flex items-center relative" 
            style={{ gap: "clamp(1.2rem, 2vw, 1.8rem)" }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group transform transition-all duration-200 ease-in-out hover:scale-110"
            >
              <img
                src="/wpp.svg"
                alt="WhatsApp"
                className="transition-all duration-200"
                style={{ 
                  width: "clamp(24px, 2vw, 32px)", 
                  height: "auto"
                }}
              />
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-xs py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Fale conosco
              </div>
            </a>

            <button 
              className="group transform transition-all duration-200 ease-in-out hover:scale-110 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <img
                src="/sino.svg"
                alt="Notificações"
                className="transition-all duration-200"
                style={{ 
                  width: "clamp(24px, 2vw, 32px)", 
                  height: "auto"
                }}
              />
              <span 
                className="absolute top-0 right-0 block rounded-full" 
                style={{ 
                  width: "clamp(6px, 0.5vw, 8px)", 
                  height: "clamp(6px, 0.5vw, 8px)",
                  backgroundColor: "black" 
                }} 
              />
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-xs py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Notificações
              </div>
            </button>

            {/* Popup de Notificações */}
            {showNotifications && (
              <motion.div 
                className="absolute top-[calc(100%+1rem)] right-0 bg-zinc-900/95 backdrop-blur-sm rounded-xl shadow-lg p-4 min-w-[280px] border border-zinc-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-white">Notificações</span>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-zinc-400 hover:text-white transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="text-zinc-400 text-xs">
                  Nenhuma notificação no momento
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Resto do conteúdo */}
      <div className="relative w-full h-[calc(100vh-clamp(100px,12vh,140px))]">
        {/* Título com seta */}
        <motion.div 
          className="text-center mt-8 mb-4 flex items-center justify-center gap-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1
            className="font-bold capitalize"
            style={{
              fontSize: "clamp(2rem, 6vw, 4rem)",
              letterSpacing: "-0.03em",
            }}
          >
            {nomeFormatado}
          </h1>
          <motion.img 
            src="/seta titulo.svg" 
            alt="Seta" 
            className="w-6 h-6 mt-1"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          />
        </motion.div>

        <motion.p
          className="text-center text-zinc-600"
          style={{
            fontSize: "clamp(0.9rem, 1.4vw, 1.2rem)",
            marginTop: "-1.1rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Selecione o produto abaixo.
        </motion.p>

        {loading ? (
          <div className="flex items-center justify-center h-[65%]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1A1A1A]"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[65%] gap-4">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-500 text-xl font-medium">Erro ao carregar produtos</p>
            <p className="text-[#666] text-base">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[65%] gap-4">
            <svg className="w-16 h-16 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[#666] text-xl">Nenhum produto encontrado</p>
            <button 
              onClick={() => navigate('/menu')}
              className="mt-4 px-6 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors"
            >
              Voltar para o menu
            </button>
          </div>
        ) : (
          <>
            {/* Carrossel responsivo com hover */}
            <motion.div
              className="flex h-[65%] w-full mx-auto items-center justify-center mt-4 relative overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="flex absolute w-full justify-center"
                style={{
                  x: currentIndex * -100 + "%",
                  transition: "transform 0.3s ease-in-out"
                }}
              >
                {produtos.map((prod, index) => (
                  <motion.div
                    key={index}
                    onClick={() => navigate(`/produto/${prod.slug}`)}
                    className="w-full flex flex-col items-center justify-center cursor-pointer group px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div className="relative w-[200px] mb-6">
                      <motion.img
                        src={prod.imagem}
                        alt={prod.nome}
                        className="w-full h-auto object-contain"
                      />
                    </motion.div>
                    <motion.h2 
                      className="text-[24px] font-medium text-black text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {prod.nome}
                    </motion.h2>
                    <motion.h3
                      className="text-[20px] font-medium text-zinc-600 text-center mt-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {prod.nomeSecundario}
                    </motion.h3>
                    <motion.p
                      className="text-[16px] text-zinc-500 text-center mt-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {prod.subtitulo}
                    </motion.p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Setas de navegação */}
            <motion.button
              onClick={prev}
              className="absolute left-[10%] top-1/2 transform -translate-y-1/2 z-40 bg-[#E6E6E6] hover:bg-[#D4D4D4] rounded-full w-[40px] h-[40px] flex items-center justify-center transition-colors"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
            <motion.button
              onClick={next}
              className="absolute right-[10%] top-1/2 transform -translate-y-1/2 z-40 bg-[#E6E6E6] hover:bg-[#D4D4D4] rounded-full w-[40px] h-[40px] flex items-center justify-center transition-colors"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
