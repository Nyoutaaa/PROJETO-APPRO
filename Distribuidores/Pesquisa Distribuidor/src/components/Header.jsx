import React, { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi'; // Ícones do react-icons

// Substitua 'LogoAp-white.svg' pelo caminho real do seu logo
import logoSrc from '../assets/LogoAp-white.svg';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-black text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-center items-center border-b border-white/30">
        {/* Logo */}
        <div className="h-8">
          <img src={logoSrc} alt="A&P Cosmética" className="h-full w-auto" />
        </div>

        {/* Ícone do Menu (Mobile) - Posicionado absolutamente */}
        <div className="absolute right-6 md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>

        {/* Navegação (Desktop) */}
        <nav className="hidden md:flex space-x-6 items-center">
          {/* <a href="#" className="hover:text-gray-400">Link 1</a>
          <a href="#" className="hover:text-gray-400">Link 2</a> */}
        </nav>
      </div>

      {/* Menu Mobile (Dropdown) */}
      {isOpen && (
        <div className="md:hidden bg-black pb-4">
          <nav className="flex flex-col items-center space-y-3">
            {/* Adicione links do menu mobile aqui, se houver */}
            {/* <a href="#" className="hover:text-gray-400">Link 1</a>
            <a href="#" className="hover:text-gray-400">Link 2</a> */}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 