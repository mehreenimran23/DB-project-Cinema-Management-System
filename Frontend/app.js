(function bootstrapCineVerse() {
  const BOOKING_KEY = "cineverse.booking";
  const USER_KEY = "cineverse.user";
  const SERVER_ORIGIN = "http://localhost:3002";
  const isFileMode = window.location.protocol === "file:";
  const apiBase = isFileMode ? `${SERVER_ORIGIN}/api` : "/api";

  async function api(path, options) {
    const config = options || {};
    const headers = { ...(config.headers || {}) };

    if (config.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    let response;
    try {
      response = await fetch(`${apiBase}${path}`, {
        ...config,
        headers,
      });
    } catch {
      if (isFileMode) {
        throw new Error(
          "Could not reach the CineVerse server. Run `node home.js` inside the Backend folder, then refresh this page."
        );
      }

      throw new Error("Could not reach the CineVerse server. Please try again.");
    }

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === "string"
          ? payload
          : payload.error || payload.message || "Something went wrong.";
      throw new Error(message);
    }

    return payload;
  }

  function getBooking() {
    try {
      return JSON.parse(sessionStorage.getItem(BOOKING_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function setBooking(nextBooking) {
    sessionStorage.setItem(BOOKING_KEY, JSON.stringify(nextBooking));
    return nextBooking;
  }

  function mergeBooking(partial) {
    return setBooking({ ...getBooking(), ...partial });
  }

  function clearBooking() {
    sessionStorage.removeItem(BOOKING_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  function formatCurrency(value) {
    const amount = Number(value || 0);
    return `Rs. ${amount.toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(value) {
    if (!value) {
      return "N/A";
    }

    return new Date(value).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getTicketPrice(showType) {
    return showType === "PLATINUM" ? 1500 : 1200;
  }

  function getSeatPrice(showType) {
    return showType === "PLATINUM" ? 250 : 150;
  }

  function posterFallback(title, label) {
    const safeTitle = String(title || "CineVerse Feature");
    const safeLabel = String(label || "Now Showing");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1350" viewBox="0 0 900 1350">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#031008"/>
            <stop offset="55%" stop-color="#07150f"/>
            <stop offset="100%" stop-color="#0f2d1d"/>
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="18%" r="65%">
            <stop offset="0%" stop-color="#2e8b57" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#2e8b57" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="900" height="1350" fill="url(#bg)"/>
        <rect x="34" y="34" width="832" height="1282" rx="30" fill="none" stroke="#3ca56a" stroke-width="3" opacity="0.5"/>
        <circle cx="450" cy="220" r="250" fill="url(#glow)"/>
        <text x="450" y="160" text-anchor="middle" fill="#9cdab4" font-family="Bahnschrift, Arial, sans-serif" font-size="36" letter-spacing="8">${safeLabel.toUpperCase()}</text>
        <text x="450" y="650" text-anchor="middle" fill="#f4fff8" font-family="Bahnschrift, Arial, sans-serif" font-size="76" font-weight="700">${safeTitle}</text>
        <text x="450" y="735" text-anchor="middle" fill="#8ea79a" font-family="Bahnschrift, Arial, sans-serif" font-size="30">CineVerse Studios</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function menuImageFallback(title, label) {
    const safeTitle = String(title || "CineVerse Menu");
    const safeLabel = String(label || "Fresh Counter");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#041009"/>
            <stop offset="55%" stop-color="#0a1912"/>
            <stop offset="100%" stop-color="#123524"/>
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="18%" r="65%">
            <stop offset="0%" stop-color="#48b57a" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#48b57a" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="960" height="640" fill="url(#bg)"/>
        <rect x="28" y="28" width="904" height="584" rx="28" fill="none" stroke="#3ca56a" stroke-width="3" opacity="0.45"/>
        <circle cx="480" cy="120" r="220" fill="url(#glow)"/>
        <text x="480" y="118" text-anchor="middle" fill="#9cdab4" font-family="Bahnschrift, Arial, sans-serif" font-size="28" letter-spacing="6">${safeLabel.toUpperCase()}</text>
        <text x="480" y="324" text-anchor="middle" fill="#f4fff8" font-family="Bahnschrift, Arial, sans-serif" font-size="62" font-weight="700">${safeTitle}</text>
        <text x="480" y="388" text-anchor="middle" fill="#8ea79a" font-family="Bahnschrift, Arial, sans-serif" font-size="24">Freshly served at CineVerse Studios</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function attachImageFallbacks(root) {
    const scope = root || document;
    scope.querySelectorAll("img[data-fallback]").forEach((img) => {
      img.addEventListener(
        "error",
        () => {
          img.onerror = null;
          img.src =
            img.dataset.fallback === "snack"
              ? menuImageFallback(img.dataset.title, img.dataset.label)
              : posterFallback(img.dataset.title, img.dataset.label);
        },
        { once: true }
      );
    });
  }

  window.CineVerseApp = {
    api,
    getBooking,
    setBooking,
    mergeBooking,
    clearBooking,
    getUser,
    setUser,
    apiBase,
    serverOrigin: SERVER_ORIGIN,
    isFileMode,
    formatCurrency,
    formatDate,
    getTicketPrice,
    getSeatPrice,
    posterFallback,
    menuImageFallback,
    attachPosterFallbacks: attachImageFallbacks,
    attachImageFallbacks,
  };
})();
