import { supabase } from '../supabaseClient';

// Função para calcular a distância entre duas coordenadas em km (fórmula de Haversine)
const calcularDistancia = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c; // Distância em km
  
  return distancia;
};

// Função para formatar a distância
const formatarDistancia = (distancia) => {
  if (distancia === null || distancia === undefined) return null;
  
  if (distancia < 1) {
    return `${Math.round(distancia * 1000)}m`;
  } else {
    return `${Math.round(distancia)}km`;
  }
};

export const getDistribuidores = async () => {
  try {
    console.log('Buscando distribuidores do Supabase...');
    
    // Primeiro, buscar todos os planos disponíveis para criar um mapeamento
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('*');
      
    if (plansError) {
      console.error('Erro ao buscar planos:', plansError);
    }
    
    // Criar mapeamento de planos se existirem
    const plansMap = {};
    if (plans && plans.length > 0) {
      plans.forEach(plan => {
        plansMap[plan.id] = plan;
      });
    }
    
    // Buscar distribuidores (incluindo cidade e estado)
    const { data, error } = await supabase
      .from('distribuidores')
      .select('id, name, email, phone, address, instagram, logo_url, plan_id, cidade, estado');
    
    if (error) {
      console.error('Erro ao buscar distribuidores:', error);
      throw error;
    }
    
    // Enriquecer os dados dos distribuidores com informações dos planos
    const enrichedData = data.map(distributor => {
      // Se temos o plano mapeado, adicionamos suas informações
      if (distributor.plan_id && plansMap[distributor.plan_id]) {
        return {
          ...distributor,
          plan: plansMap[distributor.plan_id]
        };
      }
      return distributor;
    });
    
    console.log('Distribuidores encontrados:', enrichedData);
    return enrichedData;
  } catch (error) {
    console.error('Erro no serviço de distribuidores:', error);
    throw error;
  }
};

// Determinar a distância base para um distribuidor com base na localização
const determinarDistanciaBase = (distribuidor, userEstado, userCidade) => {
  // Se não tivermos informações de localização do usuário, usar valor alto
  if (!userEstado && !userCidade) {
    return 500 + Math.random() * 500; // 500-1000km (muito longe)
  }
  
  // Verificar se o distribuidor está na mesma cidade do usuário
  if (userCidade && 
      distribuidor.cidade && 
      distribuidor.cidade.toLowerCase() === userCidade.toLowerCase()) {
    return Math.random() * 10; // 0-10km (mesma cidade)
  }
  
  // Verificar se o distribuidor está no mesmo estado, mas cidade diferente
  if (userEstado && 
      distribuidor.estado && 
      distribuidor.estado.toLowerCase() === userEstado.toLowerCase()) {
    return 20 + Math.random() * 80; // 20-100km (mesmo estado)
  }
  
  // Distribuidor em outro estado
  return 150 + Math.random() * 350; // 150-500km (outro estado)
};

// Função para ordenar distribuidores com base nos estados e cidades
export const getDistribuidoresPorDistancia = async (latitude, longitude, raio = 100) => {
  try {
    console.log(`Iniciando busca com raio de ${raio}km para lat: ${latitude}, lng: ${longitude}`);
    const distribuidores = await getDistribuidores();
    
    // Obter estado e cidade do usuário por geolocalização reversa
    let userEstado = '';
    let userCidade = '';
    
    // Exemplo de como poderíamos obter estado e cidade, mas isso exigiria uma API
    // Está comentado pois não temos essa funcionalidade implementada ainda
    /*
    if (latitude && longitude) {
      const geocoder = new google.maps.Geocoder();
      const latlng = { lat: latitude, lng: longitude };
      
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          // Extrair cidade e estado do resultado
          results[0].address_components.forEach(component => {
            if (component.types.includes('administrative_area_level_1')) {
              userEstado = component.short_name;
            }
            if (component.types.includes('administrative_area_level_2')) {
              userCidade = component.long_name;
            }
          });
        }
      });
    }
    */
    
    // Como não temos geocodificação reversa, vamos criar uma lógica de proximidade baseada em estados e cidades
    const distribuidoresComDistancia = distribuidores.map(distribuidor => {
      // Calcular distância estimada com base na cidade/estado
      const distanciaEstimada = determinarDistanciaBase(distribuidor, userEstado, userCidade);
      const distanciaFormatada = formatarDistancia(distanciaEstimada);
      
      return {
        ...distribuidor,
        distancia: distanciaEstimada, // Valor numérico para ordenação e filtro
        distance: distanciaFormatada, // Valor formatado para exibição
        // Adicionar um campo de endereço completo para geocodificação mais precisa
        enderecoCompleto: [
          distribuidor.address,
          distribuidor.cidade,
          distribuidor.estado,
          'Brasil'
        ].filter(Boolean).join(', ')
      };
    });
    
    console.log(`Total de distribuidores antes do filtro: ${distribuidoresComDistancia.length}`);
    console.log(`Aplicando filtro de raio: ${raio}km`);
    
    // Filtrar apenas distribuidores dentro do raio especificado
    const distribuidoresFiltrados = distribuidoresComDistancia.filter(distribuidor => {
      const dentroDoRaio = distribuidor.distancia <= raio;
      if (!dentroDoRaio) {
        console.log(`Distribuidor "${distribuidor.name}" descartado - distância: ${distribuidor.distancia}km > raio: ${raio}km`);
      }
      return dentroDoRaio;
    });
    
    console.log(`Filtrados ${distribuidoresFiltrados.length} de ${distribuidoresComDistancia.length} distribuidores dentro do raio de ${raio}km`);
    
    // Ordenar por distância (aleatória ou estimada)
    return distribuidoresFiltrados.sort((a, b) => a.distancia - b.distancia);
  } catch (error) {
    console.error('Erro ao buscar distribuidores por distância:', error);
    throw error;
  }
}; 