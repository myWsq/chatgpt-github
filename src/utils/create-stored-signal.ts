import { createSignal, onMount, Signal } from "solid-js";

export function createStoredSignal<T>(key: string, defaultValue: T): Signal<T> {
  const [value, setValue] = createSignal<T>(defaultValue);

  onMount(() => {
    const initialValue = localStorage.getItem(key)
      ? (JSON.parse(localStorage.getItem(key)) as T)
      : defaultValue;
    setValue(() => initialValue);
  });

  const setValueAndStore = ((arg) => {
    const v = setValue(arg);
    localStorage.setItem(key, JSON.stringify(v));
    return v;
  }) as typeof setValue;

  return [value, setValueAndStore];
}
