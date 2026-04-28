import "@testing-library/jest-dom/vitest";

// Mock chrome APIs for testing
const storageMock: Record<string, unknown> = {};

const chromeMock = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    sendMessage: vi.fn(),
    onInstalled: {
      addListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
  },
  storage: {
    local: {
      get: vi.fn((keys: string | string[]) => {
        if (typeof keys === "string") {
          return Promise.resolve({ [keys]: storageMock[keys] });
        }
        const result: Record<string, unknown> = {};
        for (const key of keys) {
          result[key] = storageMock[key];
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(storageMock, items);
        return Promise.resolve();
      }),
      remove: vi.fn((keys: string | string[]) => {
        const keyArr = typeof keys === "string" ? [keys] : keys;
        for (const key of keyArr) {
          delete storageMock[key];
        }
        return Promise.resolve();
      }),
    },
  },
  debugger: {
    attach: vi.fn(),
    detach: vi.fn(),
    sendCommand: vi.fn(),
    onEvent: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onDetach: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
  tabs: {
    onActivated: {
      addListener: vi.fn(),
    },
    onUpdated: {
      addListener: vi.fn(),
    },
    query: vi.fn(),
  },
};

vi.stubGlobal("chrome", chromeMock);
