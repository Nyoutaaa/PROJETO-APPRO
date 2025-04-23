import React, { useState, useCallback } from 'react';
import { FaMapMarkerAlt, FaTimesCircle } from 'react-icons/fa';
import { MdMyLocation } from 'react-icons/md';

const LocationFinder = ({ onLocationFound, onLocationError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleSuccess = useCallback((position) => {
    const { latitude, longitude } = position.coords;
    setLoading(false);
    setError(null);
    setPermissionDenied(false);
    
    if (latitude && longitude) {
      console.log('Localização encontrada:', latitude, longitude);
      onLocationFound({ lat: latitude, lng: longitude });
    } else {
      setError('Não foi possível obter as coordenadas de localização');
    }
  }, [onLocationFound]);

  const handleError = useCallback((error) => {
    setLoading(false);
    
    if (error.code === 1) { // PERMISSION_DENIED
      setPermissionDenied(true);
      setError('Permissão para localização negada');
    } else if (error.code === 2) { // POSITION_UNAVAILABLE
      setError('Localização indisponível. Verifique se o GPS está ativado.');
    } else if (error.code === 3) { // TIMEOUT
      setError('Tempo esgotado ao buscar localização. Tente novamente.');
    } else {
      setError(`Erro ao buscar localização: ${error.message}`);
    }
    
    onLocationError && onLocationError(error);
  }, [onLocationError]);

  const getLocation = useCallback(() => {
    if (loading) return; // Evita múltiplas chamadas enquanto carrega
    
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    try {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      );
    } catch (err) {
      setLoading(false);
      setError('Erro ao iniciar serviço de localização');
    }
  }, [loading, handleSuccess, handleError]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaMapMarkerAlt className="text-blue-600" />
        Sua localização
      </h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-3 flex items-center">
          <FaTimesCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <button
        onClick={getLocation}
        disabled={loading}
        className={`
          flex items-center justify-center gap-3 
          w-full py-4 px-6 
          rounded-[24px] 
          text-white text-lg font-medium 
          transition-all duration-300 ease-in-out
          transform hover:scale-[1.02]
          ${loading 
            ? 'bg-gray-400 cursor-not-allowed opacity-75' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-[0.98]'
          }
          shadow-md hover:shadow-xl
          relative overflow-hidden
        `}
      >
        <MdMyLocation className={`text-2xl transition-transform ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
        <span className="relative z-10">
          {loading ? 'Buscando sua localização...' : 'Usar minha localização atual'}
        </span>
        {loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
               style={{ backgroundSize: '200% 100%' }} />
        )}
      </button>
      
      {permissionDenied && (
        <p className="text-sm text-gray-600 mt-3 text-center">
          Para usar esta funcionalidade, você precisa permitir o acesso à sua localização nas configurações do seu navegador.
        </p>
      )}
    </div>
  );
};

export default LocationFinder; 