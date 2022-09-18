/**
 * Source data may contain ' and " which may break your sql, escape them using this function.
 */
export const escape = (source: string): string => {
  return source.replace(/"/g, `'`).replace(/'/g, `''`);
};
