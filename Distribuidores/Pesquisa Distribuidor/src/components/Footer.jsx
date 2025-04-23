import React from 'react';
import { FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-gray-400 py-8 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Ícone de Rede Social */}
        <div className="mb-4">
           <p className="text-sm mb-2">Rede Social</p>
           <a
            href="https://instagram.com/apcosmetica_oficial" // Substitua pelo link real do Instagram
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block p-2 rounded-full border border-gray-600 hover:border-white hover:text-white transition-colors"
            aria-label="Instagram da A&P Cosmética"
           >
             <FaInstagram size={24} />
           </a>
        </div>

        {/* Informações da Empresa */}
        <div className="text-xs">
          <p>A & P COSMETICA LTDA - CNPJ: 38.730.213/0001-41</p>
          <p>&copy; {currentYear} Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 