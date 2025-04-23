import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDistance } from '../utils/distance';
import L from 'leaflet';
import { FaStoreAlt, FaInstagram, FaWhatsapp, FaMapMarkedAlt } from 'react-icons/fa';

// Corrigir os ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

// Estilos personalizados para o mapa
const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '16px',
};

const defaultCenter = [-23.5505, -46.6333]; // São Paulo

const MapView = ({ distribuidores, userLocation, onDistribuidorClick, currentLocation, currentView, maxDistance }) => {
  const [selectedDistribuidor, setSelectedDistribuidor] = useState(null);
  const [distribuidoresComCoordenadas, setDistribuidoresComCoordenadas] = useState([]);
  const [geocodingStatus, setGeocodingStatus] = useState({
    total: 0,
    processados: 0,
    sucesso: 0
  });
  const [center, setCenter] = useState(defaultCenter);

  const defaultCenter = [-23.5505, -46.6333]; // São Paulo

  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation]);

  // Função para geocodificar endereços usando Nominatim (OpenStreetMap)
  const geocodeAddress = async (endereco) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&countrycodes=br`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao geocodificar:', error);
      return null;
    }
  };

  // Geocodificar endereços dos distribuidores
  useEffect(() => {
    if (!distribuidores.length) return;

    const geocodificarEnderecos = async () => {
      setGeocodingStatus({
        total: distribuidores.length,
        processados: 0,
        sucesso: 0
      });

      const resultados = [];
      
      for (const distribuidor of distribuidores) {
        // Aguardar 1 segundo entre as requisições para respeitar o limite de rate do Nominatim
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const endereco = distribuidor.enderecoCompleto || 
                        [distribuidor.address, distribuidor.cidade, distribuidor.estado, 'Brasil']
                        .filter(Boolean).join(', ');
        
        if (!endereco) {
          setGeocodingStatus(prev => ({
            ...prev,
            processados: prev.processados + 1
          }));
          continue;
        }

        const coords = await geocodeAddress(endereco);
        
        if (coords) {
          resultados.push({
            ...distribuidor,
            tempLat: coords.lat,
            tempLng: coords.lng
          });
          
          setGeocodingStatus(prev => ({
            ...prev,
            processados: prev.processados + 1,
            sucesso: prev.sucesso + 1
          }));
        } else {
          setGeocodingStatus(prev => ({
            ...prev,
            processados: prev.processados + 1
          }));
        }
      }

      setDistribuidoresComCoordenadas(resultados);
    };

    geocodificarEnderecos();
  }, [distribuidores]);

  // Função para determinar o centro do mapa
  const getMapCenter = () => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      return [userLocation.lat, userLocation.lng];
    }
    
    if (distribuidoresComCoordenadas && distribuidoresComCoordenadas.length > 0) {
      return [
        distribuidoresComCoordenadas[0].tempLat,
        distribuidoresComCoordenadas[0].tempLng
      ];
    }
    
    // Centro padrão (Brasil)
    return [-15.77972, -47.92972];
  };

  // Função para abrir o WhatsApp
  const openWhatsApp = (phone) => {
    if (!phone) return;
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };
  
  // Função para abrir o Instagram
  const openInstagram = (instagram) => {
    if (!instagram) return;
    const username = instagram.replace(/^@/, '');
    window.open(`https://instagram.com/${username}`, '_blank');
  };
  
  // Função para abrir o OpenStreetMap
  const openMapLink = (address) => {
    if (!address) return;
    const query = encodeURIComponent(address);
    window.open(`https://www.openstreetmap.org/search?query=${query}`, '_blank');
  };

  // Renderizar o endereço formatado
  const renderEndereco = (distribuidor) => {
    const partes = [];
    if (distribuidor.address) partes.push(distribuidor.address);
    if (distribuidor.cidade) partes.push(distribuidor.cidade);
    if (distribuidor.estado) partes.push(distribuidor.estado);
    return partes.join(', ');
  };

  const filteredDistribuidores = distribuidores.map(distribuidor => {
    if (!userLocation || !distribuidor.latitude || !distribuidor.longitude) return distribuidor;

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      distribuidor.latitude,
      distribuidor.longitude
    );

    return {
      ...distribuidor,
      distance
    };
  }).filter(distribuidor => 
    !userLocation || !distribuidor.distance || distribuidor.distance <= maxDistance
  );

  return (
    <div className="w-full">
      {currentView === 'map' ? (
        <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {userLocation && (
              <Marker position={[userLocation.latitude, userLocation.longitude]}>
                <Popup>Sua localização</Popup>
              </Marker>
            )}

            {filteredDistribuidores.map((distribuidor) => (
              distribuidor.latitude && distribuidor.longitude && (
                <Marker 
                  key={distribuidor.id} 
                  position={[distribuidor.latitude, distribuidor.longitude]}
                >
                  <Popup>
                    <div>
                      <h3 className="font-bold">{distribuidor.nome}</h3>
                      <p>{distribuidor.endereco}</p>
                      {distribuidor.distance && (
                        <p>Distância: {distribuidor.distance.toFixed(2)} km</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDistribuidores.map((distribuidor) => (
            <div
              key={distribuidor.id}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <h3 className="font-bold text-lg">{distribuidor.nome}</h3>
              <p className="text-gray-600">{distribuidor.endereco}</p>
              {distribuidor.distance && (
                <p className="mt-2 text-sm text-gray-500">
                  Distância: {distribuidor.distance.toFixed(2)} km
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Status de carregamento do mapa */}
      {geocodingStatus.processados < geocodingStatus.total && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-blue-700">
          <div className="flex items-center gap-2">
            <FaMapMarkedAlt className="animate-pulse" />
            <span>Processando endereços: {geocodingStatus.processados} de {geocodingStatus.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(geocodingStatus.processados / geocodingStatus.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {distribuidoresComCoordenadas.length === 0 && distribuidores.length > 0 && geocodingStatus.processados === geocodingStatus.total && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-amber-700">
          Não foi possível localizar nenhum distribuidor no mapa. Verifique se os endereços estão corretos.
        </div>
      )}
      
      {distribuidoresComCoordenadas.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg text-green-700">
          {distribuidoresComCoordenadas.length} de {distribuidores.length} distribuidores localizados no mapa.
        </div>
      )}
    </div>
  );
};

export default MapView; 