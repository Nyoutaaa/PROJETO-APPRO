import React from 'react';
import { FaPlayCircle } from 'react-icons/fa'; // Importar ícone de Play

// Remover a importação da imagem, pois será substituída pelo vídeo
// import infoImageSrc from '../assets/info-image.jpg';

const InfoSection = () => {
  return (
    <section className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Informativo para você
      </h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Placeholder para o Player de Vídeo */}
        <div className="bg-gray-300 w-full h-64 md:h-80 flex items-center justify-center">
          {/* Ícone de Play (opcional) */}
          <FaPlayCircle size={60} className="text-gray-600 opacity-50" />
        </div>

        {/* Seção de Atenção abaixo do vídeo */}
        <div className="bg-gray-100 p-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Atenção:</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed max-w-2xl mx-auto">
                Este site apenas informa quais salões utilizam os produtos A&P Professional. A responsabilidade pela qualidade dos serviços prestados é exclusivamente do salão listado acima.
            </p>
            <div className="text-center mt-5">
                 <button className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors">
                    Saiba mais.
                 </button>
            </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection; 