export function getRequired<K, V>(map: Map<K, V>, key: K, label: string): V {
  const value = map.get(key);
  if (!value) {
    throw new Error(`Seed data missing ${label}: ${String(key)}`);
  }
  return value;
}
