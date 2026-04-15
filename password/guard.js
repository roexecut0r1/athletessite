/*
(() => {
  const HUB_LAUNCH_KEY = "passwordGameLaunch";

  const normalizePath = (pathname) => {
    const normalized = (pathname || "/").replace(/\/+$/, "");
    return normalized || "/";
  };

  const resolveHubUrl = () => {
    const guardScript =
      document.currentScript ||
      Array.from(document.scripts).find((script) => /\/guard\.js(?:\?|$)/.test(script.src));

    if (guardScript && guardScript.src) {
      return new URL("./", guardScript.src).href;
    }

    const segments = window.location.pathname.split("/").filter(Boolean);
    const passwordIndex = segments.lastIndexOf("password");

    if (passwordIndex >= 0) {
      const basePath = `/${segments.slice(0, passwordIndex + 1).join("/")}/`;
      return new URL(basePath, window.location.origin).href;
    }

    return new URL("../", window.location.href).href;
  };

  const HUB_URL = resolveHubUrl();
  const redirectToHub = () => window.location.replace(HUB_URL);

  try {
    const raw = localStorage.getItem(HUB_LAUNCH_KEY);
    if (!raw) return redirectToHub();

    const launchData = JSON.parse(raw);
    localStorage.removeItem(HUB_LAUNCH_KEY);

    const currentPath = normalizePath(window.location.pathname);
    const allowedPath = normalizePath(launchData && launchData.path);
    const expiresAt = Number(launchData && launchData.expiresAt);
    const isFresh = Number.isFinite(expiresAt) && expiresAt >= Date.now();

    if (!isFresh || allowedPath !== currentPath) redirectToHub();
  } catch {
    localStorage.removeItem(HUB_LAUNCH_KEY);
    redirectToHub();
  }
})();
*/
