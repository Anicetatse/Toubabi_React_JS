'use client';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Debug - Informations système
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Variables d'environnement :</h2>
            <p className="text-sm text-gray-600">
              NEXT_PUBLIC_MAPBOX_TOKEN: {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? '✅ Configuré' : '❌ Manquant'}
            </p>
            <p className="text-sm text-gray-600">
              NODE_ENV: {process.env.NODE_ENV}
            </p>
          </div>
          
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Test de la carte simple :</h2>
            <div className="h-64 w-full bg-blue-100 border border-blue-300 rounded-lg flex items-center justify-center">
              <p className="text-blue-800">
                Zone de test pour la carte (h-64)
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Instructions :</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Vérifiez que le token Mapbox est configuré</li>
              <li>Si la carte ne s'affiche pas, vérifiez la console du navigateur</li>
              <li>Assurez-vous que react-map-gl est correctement installé</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
