import React, { useState } from 'react';
import { FaSearch, FaListUl, FaMapMarkerAlt, FaChevronDown, FaLocationArrow } from 'react-icons/fa';

const SearchSection = ({ onSearch, onViewChange, onDistanceChange, currentView, currentDistance, onLocationSelect, onLocationError }) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Função para buscar endereços usando OpenStreetMap Nominatim
  const searchAddress = async (query) => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com a seleção de um endereço
  const handleAddressSelect = (place) => {
    setAddress(place.display_name);
    setShowSuggestions(false);
    
    onLocationSelect({
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      address: place.display_name
    });
  };

  // Função para obter a localização atual
  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      onLocationError('Geolocalização não é suportada pelo seu navegador.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Fazer geocodificação reversa para obter o endereço
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          setAddress(data.display_name);
          onLocationSelect({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: data.display_name
          });
        } catch (error) {
          console.error('Erro ao obter endereço:', error);
          onLocationSelect({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Localização atual'
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            onLocationError('Permissão para acessar a localização foi negada.');
            break;
          case error.POSITION_UNAVAILABLE:
            onLocationError('Informação de localização indisponível.');
            break;
          case error.TIMEOUT:
            onLocationError('Tempo esgotado ao tentar obter localização.');
            break;
          default:
            onLocationError('Ocorreu um erro ao tentar obter sua localização.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Função para lidar com mudanças no input de busca
  const handleInputChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    if (value.trim()) {
      // Debounce para evitar muitas requisições
      const timeoutId = setTimeout(() => {
        searchAddress(value);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-4 md:my-8 shadow-lg rounded-[24px] md:rounded-[36px] overflow-hidden">
      {/* Parte Superior Escura */}
      <div className="bg-[#1C1C1C] py-8 md:py-12 px-4 md:px-10">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 px-2">
            <span className="text-white">Encontre o </span>
            <span className="bg-gradient-to-b from-[#F8E7BF] to-[#E5C884] text-transparent bg-clip-text">
              Distribuidor
            </span>
            <span className="text-white"> mais<br />próximo de você.</span>
          </h1>
          
          <div className="relative max-w-xl mx-auto px-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Digite um endereço para buscar distribuidores próximos"
                  value={address}
                  onChange={handleInputChange}
                  className="w-full px-4 md:px-6 py-2.5 md:py-3 rounded-[24px] md:rounded-[36px] text-gray-800 bg-gray-100 text-base md:text-lg focus:outline-none border border-gray-300"
                  id="location-input"
                  disabled={isLoading}
                />
                
                {/* Lista de sugestões */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((place, index) => (
                      <button
                        key={`${place.place_id}-${index}`}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleAddressSelect(place)}
                      >
                        {place.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={getCurrentLocation}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isLoading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <FaLocationArrow className={isLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Usar minha localização</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Parte Inferior Clara */}
      <div className="bg-white px-4 md:px-10 py-4 md:py-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
          {/* Seletor de Distância */}
          <div className="relative w-full sm:w-64">
            <select
              value={currentDistance}
              onChange={(e) => onDistanceChange(e.target.value)}
              className="appearance-none w-full bg-gray-100 text-gray-500 py-2 md:py-3 px-4 md:px-6 rounded-[24px] md:rounded-[36px] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer border-0 text-center text-base md:text-lg"
            >
              <option value="10km">10km</option>
              <option value="25km">25km</option>
              <option value="50km">50km</option>
              <option value="100km">100km</option>
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none text-sm md:text-base" />
          </div>

          {/* Botões Lista/Mapa */}
          <div className="flex space-x-4 md:space-x-6 mt-2 sm:mt-0">
            <button
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-1.5 md:gap-2 text-base md:text-lg transition-colors ${ 
                currentView === 'list'
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FaListUl className="text-sm md:text-base" />
              Lista
            </button>
            <button
              onClick={() => onViewChange('map')}
              className={`flex items-center gap-1.5 md:gap-2 text-base md:text-lg transition-colors ${ 
                currentView === 'map'
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FaMapMarkerAlt className="text-sm md:text-base" />
              Mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection; 