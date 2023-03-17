import type { ChatMessage } from "@/types";
import { Component, createSignal, Index, Show } from "solid-js";
import IconClear from "./icons/Clear";
import MessageItem from "./MessageItem";
import SystemRoleSettings from "./SystemRoleSettings";
import _ from "lodash";
import { $apiKey } from "@/stores/api-key";
import { generatePayload, parseOpenAIStream } from "@/utils/openAI";

const scrollToBottom = _.throttle(
  function () {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });
  },
  100,
  {
    leading: true,
    trailing: true,
  }
);

const Content: Component = () => {
  const endpoint = import.meta.env.PUBLIC_OPENAI_ENDPOINT;

  if (!endpoint) {
    return (
      <div class="text-red">
        Environment variable `PUBLIC_OPENAI_ENDPOINT` is not provided
      </div>
    );
  }

  let inputRef: HTMLTextAreaElement;
  const [currentSystemRoleSettings, setCurrentSystemRoleSettings] =
    createSignal("");
  const [systemRoleEditing, setSystemRoleEditing] = createSignal(false);
  const [messageList, setMessageList] = createSignal<ChatMessage[]>([]);
  const [currentAssistantMessage, setCurrentAssistantMessage] =
    createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [controller, setController] = createSignal<AbortController>(null);

  const handleButtonClick = async () => {
    const inputValue = inputRef.value;
    if (!inputValue) {
      return;
    }
    inputRef.value = "";
    setMessageList([
      ...messageList(),
      {
        role: "user",
        content: inputValue,
      },
    ]);
    scrollToBottom();
    requestWithLatestMessage();
  };

  const requestWithLatestMessage = async () => {
    setLoading(true);
    setCurrentAssistantMessage("");
    try {
      const controller = new AbortController();
      setController(controller);
      const requestMessageList = [...messageList()];
      if (currentSystemRoleSettings()) {
        requestMessageList.unshift({
          role: "system",
          content: currentSystemRoleSettings(),
        });
      }
      const payload = generatePayload($apiKey.value(), requestMessageList);
      const response = await fetch(`${endpoint}/v1/chat/completions`, {
        ...payload,
        signal: controller.signal,
      }).then((response) => {
        if (!response.ok) {
          return response;
        }
        return new Response(parseOpenAIStream(response));
      });
      const data = response.body;
      if (!data) {
        throw new Error("No data");
      }
      const reader = data.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          let char = decoder.decode(value);
          if (char === "\n" && currentAssistantMessage().endsWith("\n")) {
            continue;
          }
          if (char) {
            setCurrentAssistantMessage(currentAssistantMessage() + char);
          }
          scrollToBottom();
        }
        done = readerDone;
      }
      scrollToBottom();
    } catch (e) {
      console.error(e);
      setLoading(false);
      setController(null);
      return;
    }
    archiveCurrentMessage();
  };

  const archiveCurrentMessage = () => {
    if (currentAssistantMessage()) {
      setMessageList([
        ...messageList(),
        {
          role: "assistant",
          content: currentAssistantMessage(),
        },
      ]);
      setCurrentAssistantMessage("");
      setLoading(false);
      setController(null);
      inputRef.focus();
    }
  };

  const clear = () => {
    inputRef.value = "";
    inputRef.style.height = "auto";
    setMessageList([]);
    setCurrentAssistantMessage("");
    setCurrentSystemRoleSettings("");
  };

  const stopStreamFetch = () => {
    if (controller()) {
      controller().abort();
      archiveCurrentMessage();
    }
  };

  const retryLastFetch = () => {
    if (messageList().length > 0) {
      const lastMessage = messageList()[messageList().length - 1];
      if (lastMessage.role === "assistant") {
        setMessageList(messageList().slice(0, -1));
        requestWithLatestMessage();
      }
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.isComposing || e.shiftKey) {
      return;
    }
    if (e.key === "Enter") {
      handleButtonClick();
    }
  };

  return (
    <>
      <SystemRoleSettings
        canEdit={() => messageList().length === 0}
        systemRoleEditing={systemRoleEditing}
        setSystemRoleEditing={setSystemRoleEditing}
        currentSystemRoleSettings={currentSystemRoleSettings}
        setCurrentSystemRoleSettings={setCurrentSystemRoleSettings}
      />
      <Index each={messageList()}>
        {(message, index) => (
          <MessageItem
            role={message().role}
            message={message().content}
            showRetry={() =>
              message().role === "assistant" &&
              index === messageList().length - 1
            }
            onRetry={retryLastFetch}
          />
        )}
      </Index>
      {currentAssistantMessage() && (
        <MessageItem role="assistant" message={currentAssistantMessage} />
      )}
      <div class="h-4"></div>
      <div class="pb-4 z-1 sticky bottom-0 bg-#171921">
        <Show
          when={!loading()}
          fallback={() => (
            <div class="h-12 space-x-4 flex items-center justify-center bg-slate bg-op-15 text-slate rounded-sm">
              <span>AI is thinking...</span>
              <div
                class="px-2 py-0.5 border border-slate text-slate rounded-md text-sm op-70 cursor-pointer hover:bg-slate/10"
                onClick={stopStreamFetch}
              >
                Stop
              </div>
            </div>
          )}
        >
          <div
            class="flex items-center space-x-2 transition-opacity"
            class:op-50={systemRoleEditing()}
          >
            <textarea
              ref={inputRef!}
              disabled={systemRoleEditing()}
              onKeyDown={handleKeydown}
              placeholder="Enter something..."
              autocomplete="off"
              autofocus
              onInput={() => {
                inputRef.style.height = "auto";
                inputRef.style.height = inputRef.scrollHeight + "px";
              }}
              rows="1"
              w-full
              px-3
              py-3
              min-h-12
              max-h-36
              text-slate
              rounded-sm
              bg-slate
              bg-op-15
              resize-none
              focus:bg-op-20
              focus:ring-0
              focus:outline-none
              placeholder:text-slate-400
              placeholder:op-30
              scroll-pa-8px
            />
            <button
              onClick={handleButtonClick}
              disabled={systemRoleEditing()}
              h-12
              px-4
              py-2
              bg-slate
              bg-op-15
              hover:bg-op-20
              text-slate
              rounded-sm
            >
              Send
            </button>
            <button
              title="Clear"
              onClick={clear}
              disabled={systemRoleEditing()}
              h-12
              px-4
              py-2
              bg-slate
              bg-op-15
              hover:bg-op-20
              text-slate
              rounded-sm
            >
              <IconClear />
            </button>
          </div>
        </Show>
      </div>
    </>
  );
};

const Generator: Component = () => {
  return (
    <Show when={!!$apiKey.value()}>
      <Content></Content>
    </Show>
  );
};

export default Generator;
