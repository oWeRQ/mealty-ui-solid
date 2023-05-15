import { createSignal, onCleanup } from "solid-js";

export default function useLocalStorage<T>(key: string, value: T) {
  const initValue = localStorage.getItem(key);
  if (!initValue) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  const [state, setState] = createSignal<T>(initValue ? JSON.parse(initValue) : value);

  const listener = (e: StorageEvent) => {
    if (e.key === key) {
      setState(JSON.parse(localStorage.getItem(key)!));
    }
  };

  const setter = (value: T) => {
    const oldValue = localStorage.getItem(key);
    const newValue = JSON.stringify(value);

    if (oldValue === newValue) {
      return;
    }

    localStorage.setItem(key, newValue);

    window.dispatchEvent(new StorageEvent('storage', {
      key,
      oldValue,
      newValue,
      storageArea: localStorage,
      url: window.location.href,
    }));
  };

  window.addEventListener('storage', listener);
  
  onCleanup(() => {
    window.removeEventListener('storage', listener);
  });

  return [state, setter] as const;
}