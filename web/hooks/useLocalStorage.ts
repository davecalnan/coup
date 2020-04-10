export const useLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(key);
};
