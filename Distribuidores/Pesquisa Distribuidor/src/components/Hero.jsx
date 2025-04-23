import React from 'react';

// Corrigir o nome do arquivo da imagem
import heroImageSrc from '../assets/hero-imagenew.png';

const Hero = () => {
  return (
    <section className="relative w-full bg-black h-[60vh] md:h-[80vh]">
      <img
        src={heroImageSrc}
        alt="A&P Cosmética Hero Image"
        className="w-full h-full object-contain"
      />
    </section>
  );
};

export default Hero; 