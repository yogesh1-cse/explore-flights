const searchInput = document.getElementById("search");
const resultsContainer = document.getElementById("results");
const resultCount = document.getElementById("result-count");

let airlines = [];

const MAX_RESULTS = 30;

async function loadAirlines() {
  try {
    const response = await fetch("./airlines.json");

    if (!response.ok) {
      throw new Error("Airline data not found");
    }

    // Load only the original 12 detailed airlines
    airlines = await response.json();

    resultsContainer.replaceChildren();
    resultCount.textContent = "";

    // Show all 12 airlines when the page first opens
    displayAirlines(airlines);
  } catch (error) {
    console.error(error);
    resultCount.textContent = "Unable to load airlines";
    resultsContainer.textContent =
      "Check airlines.json and open the website using Live Server.";
  }
}

function getInitials(name) {
  return (name || "Airline")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join("");
}

function getWebsiteUrl(website) {
  if (!website) return "";

  try {
    const url = new URL(
      website.startsWith("http") ? website : `https://${website}`
    );

    if (!["http:", "https:"].includes(url.protocol)) return "";

    return url.href;
  } catch {
    return "";
  }
}

function displayAirlines(list) {
  resultsContainer.replaceChildren();

  resultCount.textContent =
    `${list.length} airline${list.length === 1 ? "" : "s"}`;

  if (list.length === 0) {
    resultsContainer.textContent = "No matching airlines found.";
    return;
  }

  list.forEach(airline => {
    const card = document.createElement("a");
    card.className = "airline-card";

    const identifier = airline.id || airline.name;
    card.href = `airline.html?id=${encodeURIComponent(identifier)}`;

    const top = document.createElement("div");
    top.className = "card-top";

    const info = document.createElement("div");

    const logo = document.createElement("img");
    logo.className = "airline-logo";
    logo.alt = `${airline.name} logo`;

    const fallback = document.createElement("span");
    fallback.className = "airline-logo-fallback";
    fallback.textContent = getInitials(airline.name);
    fallback.setAttribute("aria-label", `${airline.name} initials`);

    const website = getWebsiteUrl(airline.website);

    if (website) {
      const hostname = new URL(website).hostname;
      logo.src =
        `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

      logo.onerror = () => {
        logo.replaceWith(fallback);
      };

      top.append(logo);
    } else {
      top.append(fallback);
    }

    const name = document.createElement("h3");
    name.textContent = airline.name || "Unknown airline";

    const country = document.createElement("p");
    country.className = "card-country";
    country.textContent = airline.country || "Country unavailable";

    info.append(name, country);
    top.append(info);

    const bottom = document.createElement("div");
    bottom.className = "card-bottom";

    const status = document.createElement("span");
    status.className = "card-status";
    status.textContent = airline.status || "Status unverified";

    const link = document.createElement("span");
    link.className = "card-link";
    link.textContent = "Explore airline →";

    bottom.append(status, link);
    card.append(top, bottom);

    resultsContainer.append(card);
  });
}

function filterAirlines() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    displayAirlines(airlines);
    return;
  }

  const filtered = airlines
    .filter(airline => {
      const name = (airline.name || "").toLowerCase();
      const country = (airline.country || "").toLowerCase();
      const iata = (airline.iata || "").toLowerCase();
      const icao = (airline.icao || "").toLowerCase();

      return (
        name.includes(query) ||
        country.includes(query) ||
        iata.includes(query) ||
        icao.includes(query)
      );
    })
    .slice(0, MAX_RESULTS);

  displayAirlines(filtered);
}

searchInput.addEventListener("input", filterAirlines);

searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    filterAirlines();

    requestAnimationFrame(() => {
      document.querySelector(".directory")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }
});

loadAirlines();
