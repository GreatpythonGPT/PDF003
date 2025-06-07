export {}; // allow module augmentation

declare global {
  interface Window {
    api: {
      selectImages: () => Promise<string[]>;
      savePDF: (data: any) => Promise<void>;
    };
  }
}
