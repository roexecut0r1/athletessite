(() => {
  const HUB_URL = "https://www.answersthroughathletes.org/password";
  const HUB_LAUNCH_KEY = "passwordGameLaunch";

  const normalizePath = (pathname) => {
    const normalized = (pathname || "/").replace(/\/+$/, "");
    return normalized || "/";
  };

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