import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

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
    <div className="fixed inset-0 bg-black text-white font-figtree overflow-hidden">
      {/* CONTAINER PRINCIPAL DO HEADER */}
      <motion.div 
        className="relative w-full pt-[clamp(3rem,5vh,4rem)]" 
        style={{ height: "clamp(100px, 12vh, 140px)" }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center w-full h-full px-[8%]">
          {/* LOGO APPRO */}
          <motion.div 
            className="relative" 
            style={{ width: "clamp(90px, 8vw, 120px)" }}
            {...fadeIn}
          >
            <button className="w-full transform transition duration-200 ease-in-out hover:scale-110">
              <img
                src="/icons/logo appro cinza.svg"
                alt="Logo Appro"
                className="w-full h-auto"
              />
            </button>
          </motion.div>

          {/* WHATSAPP + SINO */}
          <motion.div 
            className="flex items-center relative" 
            style={{ gap: "clamp(1.2rem, 2vw, 1.8rem)" }}
            {...fadeIn}
          >
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group transform transition-all duration-200 ease-in-out hover:scale-110"
            >
              <img
                src="/icons/whatsapp cinza.svg"
                alt="WhatsApp"
                className="transition-all duration-200"
                style={{ 
                  width: "clamp(24px, 2vw, 32px)", 
                  height: "auto",
                  filter: "brightness(0.6)"
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
                src="/icons/sino cinza.svg"
                alt="Notificações"
                className="transition-all duration-200"
                style={{ 
                  width: "clamp(24px, 2vw, 32px)", 
                  height: "auto",
                  filter: "brightness(0.6)"
                }}
              />
              <span 
                className="absolute top-0 right-0 block rounded-full" 
                style={{ 
                  width: "clamp(6px, 0.5vw, 8px)", 
                  height: "clamp(6px, 0.5vw, 8px)",
                  backgroundColor: "white" 
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
                  <span className="text-sm font-medium">Notificações</span>
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

      {/* CONTAINER PRINCIPAL DO CONTEÚDO */}
      <div className="relative w-full h-[calc(100vh-clamp(100px,12vh,140px))]">
        {/* BLOCO DE TEXTO AJUSTADO */}
        <motion.div 
          className="absolute top-[45%] left-[8%] transform -translate-y-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <motion.span
              className="block text-white font-bold"
              style={{
                fontSize: "clamp(3rem, 7vw, 6rem)",
                letterSpacing: "-0.03em",
                lineHeight: "1",
                marginLeft: "clamp(0.5rem, 1vw, 1rem)"
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Catálogo
            </motion.span>

            <div className="relative">
              <motion.span
                className="block text-gray-400 font-bold"
                style={{
                  fontSize: "clamp(4.5rem, 13vw, 15rem)",
                  letterSpacing: "-0.06em",
                  lineHeight: "0.9",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Digital
              </motion.span>
              
              <motion.span
                className="absolute right-0 bottom-0 text-white transform translate-y-full"
                style={{
                  fontSize: "clamp(0.875rem, 2vw, 1.5rem)",
                  letterSpacing: "-0.01em",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Distribuidor Oficial
              </motion.span>
            </div>
          </div>

          <motion.button
            onClick={() => navigate("/login")}
            className="mt-[clamp(3rem,5vh,4rem)] bg-white text-black font-semibold rounded-full shadow-lg transform transition duration-200 ease-in-out hover:scale-110"
            style={{
              fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)",
              paddingInline: "clamp(2.5rem, 7vw, 5rem)",
              paddingBlock: "clamp(1rem, 1.8vw, 1.5rem)",
              marginLeft: "clamp(0.5rem, 1vw, 1rem)"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Entrar
          </motion.button>
        </motion.div>

        {/* CONTAINER DA IMAGEM */}
        <motion.div 
          className="absolute bottom-0 right-[8%] h-[105%] pointer-events-none" 
          style={{ width: "clamp(800px, 70vw, 1400px)" }}
          {...slideIn}
        >
          <div className="relative h-full w-full">
            <img
              src="/foto anapaula.png"
              alt="Ana Paula"
              className="absolute bottom-0 right-0 h-[105%] w-auto object-contain select-none pointer-events-none"
            />
          </div>
        </motion.div>

        {/* INSTAGRAM */}
        <motion.div 
          className="absolute bottom-[5%] right-[8%] z-40"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <a
            href="https://www.instagram.com/anapaulacarvalhoof/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-white transform transition duration-200 ease-in-out hover:scale-110 hover:underline"
            style={{ 
              fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
              gap: "clamp(0.3rem, 0.6vw, 0.6rem)"
            }}
          >
            <img
              src="/icons/logo instagram.svg"
              alt="Instagram"
              style={{ width: "clamp(24px, 1.8vw, 28px)", height: "auto" }}
            />
            <span>Rede Social</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
