import React from 'react';
import DistributorCard from './DistributorCard';

const DistributorList = ({ distributors }) => {
  if (!distributors || distributors.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Nenhum distribuidor encontrado.
      </div>
    );
  }

  return (
    <section className="container mx-auto px-6 py-10 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-700 mb-8">
        Distribuidores mais próximos de você
      </h2>
      <div className="pt-2">
        {distributors.map((distributor) => (
          <DistributorCard key={distributor.id} distributor={distributor} />
        ))}
      </div>
    </section>
  );
};

export default DistributorList; 