import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getProductBySlug, getRelatedProducts } from "../lib/api";

// Dados estáticos para teste
const imagensGaleria = [
  "/galeria/1.png",
  "/galeria/2.png",
  "/galeria/3.png",
];

// Usar a imagem da pasta relacionados
const relacionados = Array(8).fill("/relacionados/1.png");

// Dados temporários do produto
const produtoTemp = {
  category: "Treatment",
  name: "Produto Exemplo",
  subtitle: "Subtítulo do Produto",
  description: "Descrição detalhada do produto com todas as suas características e benefícios.",
  rating: 5,
  price: 199.99,
  price_original: 249.99,
  price_promotional: 199.99,
  images: imagensGaleria,
  short_description: "Breve descrição do produto"
};

export default function Produto() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [imagemAtiva, setImagemAtiva] = useState(null);
  const [mostrarPreco, setMostrarPreco] = useState(false);
  const carrosselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [product, ...relacionados];

  // Função para rolar o carrossel de produtos relacionados
  const scrollCarrossel = (dir) => {
    if (!carrosselRef.current) return;
    
    const items = carrosselRef.current.querySelectorAll('.item-carrossel');
    if (items.length === 0) return;
    
    const itemWidth = items[0].offsetWidth;
    const gap = 112;
    const scrollAmount = dir === "left" ? -(itemWidth + gap) : (itemWidth + gap);
    
    carrosselRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  // Função para mudar o slide principal
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 2);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 2) % 2);
  };

  // Configurar o carrossel infinito
  useEffect(() => {
    const handleScroll = () => {
      if (!carrosselRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = carrosselRef.current;
      
      // Se chegou ao final, volta para o início
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        // Pequeno delay para que a transição do scroll termine
        setTimeout(() => {
          carrosselRef.current.scrollTo({
            left: 0,
            behavior: 'auto'
          });
        }, 100);
      }
      
      // Se chegou ao início e está rolando para trás, vai para o final
      if (scrollLeft <= 10 && scrollLeft < scrollWidth) {
        // Pequeno delay para que a transição do scroll termine
        setTimeout(() => {
          carrosselRef.current.scrollTo({
            left: scrollWidth - clientWidth,
            behavior: 'auto'
          });
        }, 100);
      }
    };

    const carrosselElement = carrosselRef.current;
    if (carrosselElement) {
      carrosselElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (carrosselElement) {
        carrosselElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Handlers para arrastar
  const handleMouseDown = (e) => {
    if (!carrosselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carrosselRef.current.offsetLeft);
    setScrollLeft(carrosselRef.current.scrollLeft);
    carrosselRef.current.style.cursor = 'grabbing';
  };

  const handleTouchStart = (e) => {
    if (!carrosselRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carrosselRef.current.offsetLeft);
    setScrollLeft(carrosselRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (carrosselRef.current) {
      carrosselRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !carrosselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carrosselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do scroll
    carrosselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !carrosselRef.current) return;
    const x = e.touches[0].pageX - carrosselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do scroll
    carrosselRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar o produto pelo slug
        const productData = await getProductBySlug(slug);

        if (productData) {
          console.log('Video URL:', productData.video_url); // Debug log
          setProduct(productData);
          setImagemAtiva(productData.images[0]);

          // Buscar produtos relacionados da mesma categoria
          const relatedData = await getRelatedProducts(productData.category, slug);

          if (relatedData) {
            setRelacionados(relatedData);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#1A1A1A]"></div>
    </div>
  );

  if (error) return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-500 text-xl">{error}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-black text-white rounded-lg">
        Tentar novamente
      </button>
    </div>
  );

  if (!product) return (
    <div className="w-full h-screen flex items-center justify-center">
      <p className="text-[#666] text-xl">Produto não encontrado</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white">
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

      {/* Conteúdo Principal (Slider) */}
      <motion.div className="relative w-full h-[calc(100vh-clamp(100px,12vh,140px))] overflow-hidden">
        <div className="flex h-full" style={{ transform: `translateX(-${slideIndex*100}%)`, transition: 'transform 0.5s ease' }}>
          {slides.map((item, idx) => (
            <div key={idx} className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] h-full gap-0">
              {/* Galeria e detalhes */}
              <div className="flex flex-col h-full justify-center px-2 sm:px-4 md:px-6 overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 w-full justify-center">
                  {/* Galeria */}
                  <div className="flex flex-col items-center justify-center w-full lg:w-1/2">
                    <div className="inline-flex rounded-[20px] shadow-lg overflow-hidden bg-gray-50 hover:shadow-xl transition-all duration-300">
                      <img
                        src={item.images[0]}
                        alt={`variante ${idx}`}
                        className="max-h-[clamp(300px,40vh,500px)] object-contain"
                      />
                    </div>
                    <div className="flex gap-2 sm:gap-3 md:gap-4 mt-3 md:mt-4 justify-center">
                      {item.images?.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`variante ${idx}`}
                          onClick={() => setImagemAtiva(img)}
                          className={`
                            w-[clamp(60px,7vw,80px)] h-[clamp(60px,7vw,80px)]
                            rounded-lg 
                            border ${imagemAtiva === img ? 'border-gray-500' : 'border-gray-200'}
                            hover:shadow-md hover:scale-110
                            cursor-pointer 
                            transition-all duration-300
                            object-cover
                          `}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Texto + Preço */}
                  <div className="flex flex-col gap-2 sm:gap-3 w-full lg:w-1/2 justify-center mt-4 lg:mt-0">
                    <p className="text-[clamp(0.75rem,1.2vw,1rem)] uppercase font-medium text-gray-500">
                      {item.category}
                    </p>
                    <h1 className="text-[clamp(1.5rem,3vw,3rem)] font-bold text-black">
                      {item.name}
                    </h1>
                    <h2 className="text-[clamp(1rem,1.8vw,1.5rem)] font-semibold text-gray-800">
                      {item.short_description}
                    </h2>
                    <p className="text-[clamp(0.75rem,1.2vw,1rem)] text-gray-700 leading-relaxed line-clamp-4 md:line-clamp-5">
                      {item.description}
                    </p>

                    {/* Avaliações */}
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <img
                          key={i}
                          src="/Star 1.svg"
                          alt="Star"
                          className="w-[clamp(12px,1.2vw,20px)] h-[clamp(12px,1.2vw,20px)] hover:scale-110 transition-all duration-300"
                        />
                      ))}
                      <span className="text-[clamp(0.75rem,1.2vw,1rem)] text-gray-600 ml-1 sm:ml-2">(56)</span>
                      <img
                        src="/compartilhr.svg"
                        alt="Compartilhar"
                        className="w-[clamp(12px,1.2vw,20px)] h-[clamp(12px,1.2vw,20px)] text-gray-500 ml-auto hover:text-gray-700 hover:scale-110 cursor-pointer transition-all duration-300"
                      />
                    </div>

                    {/* Preço */}
                    <div className="border-t pt-2 sm:pt-3 mt-2 sm:mt-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-[clamp(0.875rem,1.2vw,1.125rem)] text-gray-400">
                              {mostrarPreco ? (
                                <span className="line-through">
                                  de R$ {item.price_original?.toFixed(2)}
                                </span>
                              ) : (
                                "de ********"
                              )}
                            </span>
                            <button 
                              onClick={() => setMostrarPreco(!mostrarPreco)}
                            >
                              <img
                                src={mostrarPreco ? "/Olho aberto.svg" : "/olho fechado.svg"}
                                alt="Visualizar"
                                className="w-[clamp(24px,2vw,32px)] h-[clamp(24px,2vw,32px)] text-gray-600"
                              />
                            </button>
                          </div>
                          <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold text-black">
                            {mostrarPreco ? (
                              `R$ ${item.price_promotional?.toFixed(2)}`
                            ) : (
                              "R$ ******"
                            )}
                          </h2>
                        </div>
                        <button className="
                          bg-[#C4B398] hover:bg-[#b3a284] 
                          text-white px-[clamp(1rem,1.5vw,1.5rem)] py-[clamp(0.5rem,0.8vw,0.75rem)]
                          rounded-full shadow
                          transition-all duration-300
                          hover:scale-105
                          text-[clamp(0.75rem,1.2vw,1rem)] font-medium
                          self-end
                        ">
                          Saiba mais...
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Produtos Relacionados */}
                <div className="mt-4 sm:mt-6 md:mt-8 w-full">
                  <h3 className="text-[clamp(1rem,1.8vw,1.5rem)] font-semibold text-gray-800 mb-2 sm:mb-3 ml-[clamp(3rem,6vw,6rem)]">
                    Produtos Relacionados
                  </h3>
                  <div className="relative ml-[clamp(3rem,6vw,6rem)]">
                    <button
                      onClick={() => scrollCarrossel("left")}
                      className="
                        absolute left-0 top-1/2 transform -translate-y-1/2 z-10
                        bg-black text-white w-[clamp(20px,2vw,28px)] h-[clamp(20px,2vw,28px)] rounded-full 
                        flex items-center justify-center shadow-md
                        transition-all duration-300
                        hover:scale-110
                        p-1
                      "
                    >
                      ❮
                    </button>
                    <button
                      onClick={() => scrollCarrossel("right")}
                      className="
                        absolute right-0 top-1/2 transform -translate-y-1/2 z-10
                        bg-black text-white w-[clamp(20px,2vw,28px)] h-[clamp(20px,2vw,28px)] rounded-full 
                        flex items-center justify-center shadow-md
                        transition-all duration-300
                        hover:scale-110
                        p-1
                      "
                    >
                      ❯
                    </button>
                    <div
                      ref={carrosselRef}
                      className="flex overflow-x-auto gap-[clamp(2.5rem,4vw,5rem)] px-6 py-3 scroll-smooth hide-scrollbar cursor-grab w-[calc(100%-clamp(40px,4vw,56px))] mx-auto"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleMouseUp}
                      onTouchMove={handleTouchMove}
                    >
                      {relacionados?.map((produto, idx) => (
                        <div 
                          key={idx} 
                          className="flex-shrink-0 flex flex-col items-center item-carrossel"
                          onClick={() => navigate(`/produto/${produto.slug}`)}
                        >
                          <img
                            src={produto.images[0]}
                            alt={produto.name}
                            className="h-[clamp(64px,8vw,96px)] w-auto object-contain hover:scale-110 transition-all duration-300 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vídeo */}
              <div className="hidden lg:flex items-center justify-center h-full relative">
                <div className="absolute inset-0 bg-[url('/Group.svg')] bg-center bg-no-repeat opacity-30 pointer-events-none" style={{ backgroundSize: 'clamp(400px,45vw,600px)' }} />
                <div className="w-[clamp(220px,35vw,400px)] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl relative z-10 hover:shadow-2xl transition-all duration-300">
                  {item.video_embed ? (
                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.video_embed }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500 text-center p-4">Vídeo não disponível</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Controles do slider */}
        <button onClick={() => setSlideIndex(Math.max(slideIndex-1,0))} className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 bg-[#E6E6E6] rounded-full w-10 h-10 flex items-center justify-center">❮</button>
        <button onClick={() => setSlideIndex(Math.min(slideIndex+1, slides.length-1))} className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 bg-[#E6E6E6] rounded-full w-10 h-10 flex items-center justify-center">❯</button>
      </motion.div>
    </div>
  );
}
