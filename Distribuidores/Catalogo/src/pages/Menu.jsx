import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { getCategories } from "../lib/api";

// Dados fallback para caso a API falhe
const categoriasFallback = [
  { name: "Treatment", image: "/Treatment.jpg", slug: "treatment" },
  { name: "Transformation", image: "/Transformation.jpg", slug: "transformation" },
  { name: "Finishers", image: "/Finishers.jpg", slug: "finishers" },
  { name: "Home Care", image: "/Home care.jpg", slug: "homecare" },
];

export default function Menu() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categorias, setCategorias] = useState(categoriasFallback); // Inicializar com dados fallback
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const constraintsRef = useRef(null);
  const [dragStartX, setDragStartX] = useState(0);

  useEffect(() => {
    async function loadCategories() {
      try {
        console.log("Iniciando carregamento das categorias...");
        const data = await getCategories();
        console.log("Categorias carregadas:", data);
        if (data && data.length > 0) {
          setCategorias(data);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        setError(error.message);
        // Mantém os dados fallback em caso de erro
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  const total = categorias.length;

  const getSlides = () => {
    let slides = [];
    for (let i = 0; i < total; i++) {
      slides.push({ ...categorias[i], position: i });
    }
    return slides;
  };

  const next = () => {
    setCurrentIndex((prev) => {
      if (prev >= total - 4) return prev;
      return prev + 1;
    });
  };

  const prev = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return prev;
      return prev - 1;
    });
  };

  const handleDragStart = (event, info) => {
    setDragStartX(info.point.x);
  };

  const handleDragEnd = (event, info) => {
    const dragEndX = info.point.x;
    const diff = dragStartX - dragEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        next();
      } else {
        prev();
      }
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  const slideIn = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.4 }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black text-white font-figtree relative">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/80 text-white p-4 rounded-lg z-50">
          Erro ao carregar dados: {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          {/* Ícone Home com fundo e hover */}
          <motion.button
            onClick={() => navigate("/")}
            className="absolute bottom-8 left-8 z-50 p-4 rounded-full bg-black/50 hover:scale-110 transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img src="/Home.svg" alt="Voltar" className="w-8 h-8" />
          </motion.button>

          {/* Setas com fundo escuro circular */}
          <motion.button
            onClick={prev}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 z-40 text-white p-6 rounded-full bg-black/50 transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronLeft size={40} />
          </motion.button>
          <motion.button
            onClick={next}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 z-40 text-white p-6 rounded-full bg-black/50 transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronRight size={40} />
          </motion.button>

          {/* Carrossel com animação e drag */}
          <motion.div 
            className="flex h-full w-full overflow-hidden" 
            ref={constraintsRef}
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
              x: currentIndex * -25 + "%"
            }}
            animate={{
              x: currentIndex * -25 + "%",
              opacity: 1
            }}
            initial={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.4
            }}
          >
            {getSlides().map((cat, index) => (
              <motion.div
                key={`${cat.name}-${cat.position}`}
                className="w-1/4 h-full relative flex-shrink-0 cursor-pointer overflow-hidden group"
                onClick={() => navigate(`/categoria/${cat.slug}`)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute top-9 left-6 text-black font-bold bg-white/0 px-4 py-2 rounded-xl"
                  style={{
                    fontSize: "clamp(1.8rem,3vw,2.8rem)",
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {cat.name}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
