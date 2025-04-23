import React from 'react';
import { FaWhatsapp, FaInstagram, FaStoreAlt, FaMapMarkerAlt } from 'react-icons/fa';

const DistributorCard = ({ distributor }) => {
  // Log do distribuidor para debug
  console.log('Renderizando distribuidor:', distributor);
  
  // Gerar iniciais para avatar caso não tenha logo
  const getInitials = (name) => {
    if (!name) return 'XX';
    return name.split(' ').slice(0, 2).map(n => n[0] || '').join('');
  };
  
  // Verificar se deve exibir a distância (existente, não-nula e menor que 100)
  const deveExibirDistancia = () => {
    // Adicionar debug para entender os valores
    console.log(`Verificando distância: ${JSON.stringify({
      id: distributor.id,
      nome: distributor.name,
      distance: distributor.distance,
      distancia: distributor.distancia,
      tipo: typeof distributor.distance
    })}`);
    
    // Se a distância não estiver definida, não é válida
    if (distributor.distance === undefined || distributor.distance === null) {
      return false;
    }
    
    // Se for um número diretamente, verificar se é menor que 100
    if (typeof distributor.distancia === 'number') {
      return distributor.distancia <= 100;
    }
    
    // Se o formato for "1km" ou "500m", então deve ser válido e apenas exibir se for menor que 100km
    if (typeof distributor.distance === 'string') {
      // Se contém 'km', verificar se é menor que 100
      if (distributor.distance.includes('km')) {
        const valor = parseInt(distributor.distance, 10);
        return !isNaN(valor) && valor <= 100;
      }
      
      // Se contém 'm', sempre mostrar
      if (distributor.distance.includes('m')) {
        return true;
      }
    }
    
    // Em caso de dúvida, não mostrar
    return false;
  };
  
  const imagePlaceholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(distributor.name))}&background=e0e0e0&color=555&size=96`;

  const openMapLink = (address) => {
    if (!address) return;
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Mapeamento de UUIDs para nomes de planos (fallback)
  const planIdToName = {
    'a6106536-f274-418f-b142-167629b772f9': 'Master',
    // Adicione mais mapeamentos conforme necessário
  };

  // Função para obter nome do plano
  const getPlanName = () => {
    // Se temos os dados completos do plano
    if (distributor.plan && distributor.plan.name) {
      return distributor.plan.name;
    }
    
    // Fallback para o UUID
    if (distributor.plan_id) {
      // Tentar encontrar no mapeamento conhecido
      if (planIdToName[distributor.plan_id]) {
        return planIdToName[distributor.plan_id];
      }
      
      // Se não encontrar no mapeamento, tentar extrair do UUID
      if (distributor.plan_id.includes('master')) return 'Master';
      if (distributor.plan_id.includes('business')) return 'Business';
      if (distributor.plan_id.includes('pro')) return 'Pro';
      if (distributor.plan_id.includes('start')) return 'Start';
      if (distributor.plan_id.includes('junior')) return 'Junior';
    }
    
    // Se não conseguir identificar, mostrar um valor genérico
    return 'Distribuidor';
  };
  
  // Formatar o endereço completo
  const getEnderecoCompleto = () => {
    const partes = [];
    if (distributor.address) partes.push(distributor.address);
    if (distributor.cidade) partes.push(distributor.cidade);
    if (distributor.estado) partes.push(distributor.estado);
    
    return partes.join(', ');
  };
  
  // Formatar a localização cidade/estado
  const getLocalizacao = () => {
    if (distributor.cidade && distributor.estado) {
      return `${distributor.cidade}, ${distributor.estado}`;
    } else if (distributor.cidade) {
      return distributor.cidade;
    } else if (distributor.estado) {
      return distributor.estado;
    }
    return '';
  };

  // Usar o endereço completo para o mapa
  const handleOpenMap = () => {
    // Se temos enderecoCompleto (que vem do serviço), usar ele
    if (distributor.enderecoCompleto) {
      openMapLink(distributor.enderecoCompleto);
    } else {
      // Caso contrário, formar nosso próprio endereço completo
      openMapLink(getEnderecoCompleto());
    }
  };

  return (
    <div className="relative bg-gray-50 rounded-[24px] md:rounded-[36px] shadow-md p-4 md:p-6 mb-4 md:mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 hover:shadow-lg transition-shadow duration-200">
      {/* Badge do Plano */}
      {(distributor.plan_id || distributor.plan) && (
        <div className="absolute top-3 right-3 md:top-4 md:right-4">
          <span className="bg-black text-white text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full font-medium">
            Distribuidor {getPlanName()}
          </span>
        </div>
      )}
      
      {/* Container da Imagem */}
      <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm relative border-2 border-white mx-auto md:mx-0">
        <img
          src={distributor.logo_url || imagePlaceholder}
          alt={distributor.name}
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => { e.target.onerror = null; e.target.src = imagePlaceholder }}
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-grow min-w-0 w-full md:w-auto">
        {/* Nome */}
        <h3 className="text-xl md:text-2xl font-semibold text-gray-600 mb-2 text-center md:text-left">
          {distributor.name}
        </h3>
              
        {/* Contatos e Endereço */}
        <div className="space-y-2 md:space-y-1.5">
          {/* Telefone */}
          {distributor.phone && (
            <a href={`https://wa.me/${distributor.phone.replace(/\D/g, '')}`} 
               className="flex items-center justify-center md:justify-start gap-2 text-gray-500 hover:text-blue-600 text-sm md:text-base">
              <div className="bg-gray-200 rounded-full p-1.5">
                <FaWhatsapp className="text-gray-500" size={14} />
              </div>
              {distributor.phone}
            </a>
          )}
          
          {/* Instagram */}
          {distributor.instagram && (
            <a href={`https://instagram.com/${distributor.instagram.replace(/^@/, '')}`}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center justify-center md:justify-start gap-2 text-gray-500 hover:text-blue-600 text-sm md:text-base">
              <div className="bg-gray-200 rounded-full p-1.5">
                <FaInstagram className="text-gray-500" size={14} />
              </div>
              {distributor.instagram}
            </a>
          )}

          {/* Endereço */}
          {distributor.address && (
            <div className="mt-2">
              <div onClick={handleOpenMap}
                   className="flex items-start justify-center md:justify-start gap-2 text-blue-500 hover:underline cursor-pointer text-sm md:text-base">
                <div className="bg-gray-200 rounded-full p-1.5 mt-0.5">
                  <FaStoreAlt className="text-gray-500" size={14} />
                </div>
                <span className="leading-tight text-center md:text-left">{getEnderecoCompleto()}</span>
              </div>
            </div>
          )}
          
          {/* Localização sem endereço */}
          {!distributor.address && getLocalizacao() && (
            <div className="mt-2">
              <div className="flex items-start justify-center md:justify-start gap-2 text-gray-500 text-sm md:text-base">
                <div className="bg-gray-200 rounded-full p-1.5 mt-0.5">
                  <FaMapMarkerAlt className="text-gray-500" size={14} />
                </div>
                <span className="leading-tight">{getLocalizacao()}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Distância (se disponível e menor ou igual a 100) */}
        {deveExibirDistancia() && (
          <div className="mt-3 flex items-center text-gray-600">
            <span className="text-lg font-medium">
              A {distributor.distance} de você
            </span>
            <div className="ml-2 text-blue-500">
              <FaMapMarkerAlt size={18} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributorCard; 