import { EIP6963ProviderDetail, EIP6963AnnounceProviderEvent } from "../types";

// An array to store the detected wallet providers.
let providers: EIP6963ProviderDetail[] = [];

export const store = {
  value: () => providers,
  getSnapshot: () => providers,
  getServerSnapshot: () => [] as EIP6963ProviderDetail[],
  subscribe: (callback: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }

    function onAnnouncement(event: Event) {
      const announceEvent = event as EIP6963AnnounceProviderEvent;
      if (!announceEvent.detail || !announceEvent.detail.info) return;

      if (providers.some((p) => p.info.uuid === announceEvent.detail.info.uuid)) {
        return;
      }
      providers = [...providers, announceEvent.detail];
      callback();
    }

    // Listen for eip6963:announceProvider and call onAnnouncement when the event is triggered.
    window.addEventListener("eip6963:announceProvider", onAnnouncement as EventListener);

    // Dispatch the event, which triggers the event listener in wallet extensions.
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Return a function that removes the event listener.
    return () => {
      window.removeEventListener("eip6963:announceProvider", onAnnouncement as EventListener);
    };
  },
};