"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Kill stale service workers from previous builds first
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (let i = 0; i < regs.length; i++) {
          regs[i].unregister();
        }
      });

      // Register fresh service worker
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✅ SW registered:", registration.scope);

            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    // New version available
                    if (confirm("توجد نسخة جديدة من التطبيق. هل تريد التحديث؟")) {
                      newWorker.postMessage("SKIP_WAITING");
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("❌ SW registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
