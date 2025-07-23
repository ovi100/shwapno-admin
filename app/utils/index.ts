export const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export const formatHeader = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getArrayType = (array: any[]) => {
  if (!Array.isArray(array) || array.length === 0) return null;

  const firstType = typeof array[0];
  const allSameType = array.every((item) => typeof item === firstType);

  return allSameType ? firstType : "mixed";
};