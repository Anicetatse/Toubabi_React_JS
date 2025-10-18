/**
 * Convertit récursivement tous les BigInt en Number dans un objet
 * Utilise JSON.parse/stringify avec un replacer personnalisé pour préserver la structure
 */
export function serializeBigInt<T>(obj: T): T {
  // Utiliser JSON.stringify avec un replacer qui convertit les BigInt
  const jsonString = JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  );
  
  // Parser le JSON pour obtenir l'objet sérialisé
  return JSON.parse(jsonString);
}

