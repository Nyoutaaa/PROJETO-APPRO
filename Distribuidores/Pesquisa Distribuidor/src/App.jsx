import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchSection from './components/SearchSection';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import { getDistribuidores, getDistribuidoresPorDistancia } from './services/distribuidoresService';
import DistributorCard from './components/DistributorCard';
import LocationFinder from './components/LocationFinder';
import MapView from './components/MapView';
import { supabase } from './supabaseClient';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [distribuidores, setDistribuidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [view, setView] = useState('list'); // 'list' ou 'map'
  const [distanceFilter, setDistanceFilter] = useState('50km');
  const [selectedDistribuidor, setSelectedDistribuidor] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentView, setCurrentView] = useState('map');
  const [currentDistance, setCurrentDistance] = useState(50);

  // Converter o filtro de distância para km
  const parseDistanceFilter = (filter) => {
    return parseInt(filter.replace('km', ''));
  };

  // Função para buscar todos os distribuidores
  const fetchAllDistribuidores = async () => {
    if (isFetching) return;
    
    try {
      setIsFetching(true);
      setLoading(true);
      const data = await getDistribuidores();
      console.log("Dados do Supabase:", data);
      setDistribuidores(data || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError(`Erro ao buscar dados: ${error.message}`);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Função para buscar distribuidores com distância simulada quando temos localização
  const fetchDistribuidoresPorDistancia = async () => {
    if (isFetching) return;
    
    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      await fetchAllDistribuidores();
      return;
    }

    try {
      setIsFetching(true);
      setLoading(true);
      
      const maxDistance = parseDistanceFilter(distanceFilter);
      console.log("Buscando distribuidores com distância máxima de:", maxDistance);
      
      const data = await getDistribuidoresPorDistancia(
        userLocation.lat,
        userLocation.lng,
        maxDistance
      );
      
      console.log("Distribuidores com distância simulada:", data.length);
      setDistribuidores(data || []);
    } catch (error) {
      console.error("Erro ao buscar distribuidores por distância:", error);
      setError(`Erro ao buscar distribuidores: ${error.message}`);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Efeito para buscar os distribuidores no carregamento inicial
  useEffect(() => {
    fetchAllDistribuidores();
  }, []);

  // Uso de useCallback para evitar recriação da função em cada renderização
  const debouncedFetchDistribuidores = useCallback(
    () => {
      if (userLocation) {
        fetchDistribuidoresPorDistancia();
      }
    },
    [userLocation, distanceFilter] // Dependências da função
  );

  // Efeito para atualizar os distribuidores quando a localização ou distância mudar
  useEffect(() => {
    if (isFetching) return;
    
    // Uso de timeout para debounce, evitando múltiplas chamadas rápidas
    const timeoutId = setTimeout(() => {
      debouncedFetchDistribuidores();
    }, 500); // Aumentei o debounce para 500ms
    
    return () => clearTimeout(timeoutId); // Limpar o timeout no cleanup
  }, [debouncedFetchDistribuidores, isFetching]);

  // Função para lidar com a localização encontrada
  const handleLocationFound = useCallback((location) => {
    console.log("Localização encontrada:", location);
    setUserLocation(location);
  }, []);

  // Função para lidar com erros de localização
  const handleLocationError = useCallback((error) => {
    console.error("Erro ao obter localização:", error);
    toast.error("Não foi possível obter a localização. Por favor, tente novamente mais tarde.");
  }, []);

  // Função para alternar entre visualizações
  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  // Função para alterar o filtro de distância
  const handleDistanceChange = useCallback((newDistance) => {
    setDistanceFilter(newDistance);
  }, []);

  // Função para lidar com o clique em um distribuidor no mapa
  const handleDistribuidorClick = useCallback((distribuidor) => {
    setSelectedDistribuidor(distribuidor);
    setView('list'); // Mudar para a visualização de lista para mostrar os detalhes
    
    // Rolar até o distribuidor selecionado
    const element = document.getElementById(`distribuidor-${distribuidor.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Adicionar classe de destaque temporariamente
      element.classList.add('bg-blue-50');
      setTimeout(() => {
        element.classList.remove('bg-blue-50');
      }, 2000);
    }
  }, []);

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
  };

  if (loading && distribuidores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando distribuidores...</div>
      </div>
    );
  }

  if (error && distribuidores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchAllDistribuidores}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <div className="relative">
          <Hero />
          {/* SearchSection sobreposta ao Hero */}
          <div className="absolute left-0 right-0 bottom-0 transform translate-y-1/2 px-4">
            <div className="container mx-auto max-w-4xl">
              <SearchSection 
                onLocationSelect={handleLocationSelect}
                onLocationError={handleLocationError}
                onViewChange={handleViewChange}
                onDistanceChange={handleDistanceChange}
                currentView={currentView}
                currentDistance={currentDistance}
              />
            </div>
          </div>
        </div>
        
        {/* Container principal para conteúdo */}
        <div className="container mx-auto max-w-4xl px-4 mt-32">
          {/* Seção de Localização */}
          <LocationFinder 
            onLocationFound={handleLocationFound}
            onLocationError={handleLocationError}
          />

          {/* Alternância entre lista e mapa */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {userLocation 
                ? `Distribuidores próximos a você (${distanceFilter})` 
                : 'Todos os Distribuidores'}
            </h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setView('list')}
                className={`px-3 py-1 rounded-full ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Lista
              </button>
              <button 
                onClick={() => setView('map')}
                className={`px-3 py-1 rounded-full ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Mapa
              </button>
            </div>
          </div>
          
          {/* Vista de mapa */}
          {view === 'map' && (
            <div className="mb-8">
              <MapView 
                distribuidores={distribuidores} 
                currentLocation={currentLocation}
                currentView={currentView}
                maxDistance={currentDistance}
              />
            </div>
          )}
          
          {/* Vista de lista */}
          {view === 'list' && (
            <div>
              {distribuidores.length === 0 ? (
                <div className="text-xl text-gray-600 text-center py-12 bg-gray-50 rounded-lg">
                  {userLocation 
                    ? `Nenhum distribuidor encontrado em um raio de ${distanceFilter}.`
                    : 'Nenhum distribuidor encontrado.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {distribuidores.map((distribuidor) => (
                    <div 
                      id={`distribuidor-${distribuidor.id}`}
                      key={distribuidor.id}
                      className={`transition-all duration-500 ${selectedDistribuidor?.id === distribuidor.id ? 'ring-2 ring-blue-400 rounded-[36px]' : ''}`}
                    >
                      <DistributorCard 
                        distributor={distribuidor}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Placeholder para o Banner de Kits */}
        <div className="bg-black text-white py-8 px-4 my-8 text-center container mx-auto max-w-4xl rounded-lg">
          <h3 className="text-lg font-semibold">Kits Home Care</h3>
          <p className="text-2xl font-bold mb-4">Trate seus cabelos com eficiência!</p>
          <button className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200">
            Saiba mais
          </button>
        </div>

        <InfoSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
