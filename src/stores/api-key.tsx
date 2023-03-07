import { createStoredSignal } from "@/utils/create-stored-signal";
import { createRoot } from "solid-js";

export const $apiKey = createRoot(() => {
  const signal = createStoredSignal("__api_key__", "");
  return {
    value: signal[0],
    set: signal[1],
  };
});
