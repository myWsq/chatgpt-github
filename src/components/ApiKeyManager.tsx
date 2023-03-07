import { $apiKey } from "@/stores/api-key";
import { Component, createEffect, createSignal, Show } from "solid-js";

const ApiKeyInput: Component = () => {
  let inputRef: HTMLInputElement;
  return (
    <>
      <div class="flex space-x-2">
        <input
          ref={inputRef}
          placeholder="Enter your api key"
          value={$apiKey.value()}
          flex-grow
          px-3
          py-3
          min-h-12
          max-h-36
          text-slate
          rounded-sm
          bg-slate
          bg-op-15
          focus:bg-op-20
          focus:ring-0
          focus:outline-none
          placeholder:text-slate-400
          placeholder:op-30
        ></input>
        <button
          onClick={() => {
            $apiKey.set(inputRef.value);
          }}
          h-12
          px-4
          py-2
          bg-slate
          bg-op-15
          hover:bg-op-20
          text-slate
          rounded-sm
        >
          Set
        </button>
      </div>
      <div class="h-2"></div>
      <p class="text-sm text-slate">
        Refer to
        <a
          href="https://platform.openai.com/account/api-keys"
          target="_blank"
          class="mx-1 underline-dashed underline"
        >
          https://platform.openai.com/account/api-keys
        </a>
        to retrieve API key. Your API key will always be stored in the browser.
      </p>
    </>
  );
};

const ApiKeyManager: Component = () => {
  // 不能直接使用 derived signal, 无法显示. 不知道是 Astro 还是 Solidjs 的 Bug
  // const displayApiKey = () => {
  //   const key = $apiKey.value();
  //   setDisplayApiKey(key && key.slice(0, 5) + "..." + key.slice(-5));
  // }
  const [displayApiKey, setDisplayApiKey] = createSignal("");
  createEffect(() => {
    const key = $apiKey.value();
    setDisplayApiKey(key && key.slice(0, 5) + "..." + key.slice(-5));
  });

  return (
    <Show when={!!$apiKey.value()} fallback={<ApiKeyInput />}>
      <div class="flex items-center space-x-2 text-slate">
        <span>Api Key: {displayApiKey()}</span>
        <button
          onClick={() => $apiKey.set("")}
          class="text-sm border px-1 rounded text-slate transition-colors cursor-pointer hover:bg-slate/20 border-slate"
        >
          Clear
        </button>
      </div>
    </Show>
  );
};

export default ApiKeyManager;
