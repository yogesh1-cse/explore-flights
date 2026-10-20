 
const loading = document.getElementById("airline-loading");
const errorMessage = document.getElementById("airline-error");
const details = document.getElementById("airline-details");

const DEFAULT_AIRCRAFT_PHOTO =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=85";

function setText(id, value, fallback = "Information unavailable") {
  const element = document.getElementById(id);

  if (element) {
    element.textContent =
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
        ? value
        : fallback;
  }
}

function showError(message) {
  loading.hidden = true;
  details.hidden = true;
  errorMessage.hidden = false;
  errorMessage.textContent = message;

  const link = document.createElement("a");
  link.href = "index.html";
  link.textContent = "Return to airline directory";

  errorMessage.appendChild(document.createElement("p"));
  errorMessage.appendChild(link);
}

function getValue(airline, keys) {
  for (const key of keys) {
    const value = airline[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
}

function setupAirlineLogo(website) {
  const logo = document.getElementById("detail-logo");

  if (!logo) return;

  logo.hidden = true;
  logo.removeAttribute("src");
  logo.alt = "Airline logo";

  if (!website) return;

  try {
    const url = new URL(website);

    if (!["https:", "http:"].includes(url.protocol)) return;

    const faviconURL =
      "https://www.google.com/s2/favicons?domain=" +
      encodeURIComponent(url.hostname) +
      "&sz=128";

    logo.onerror = () => {
      logo.hidden = true;
      logo.removeAttribute("src");
    };

    logo.onload = () => {
      logo.hidden = false;
    };

    logo.src = faviconURL;
  } catch {
    logo.hidden = true;
  }
}

function setupAircraftPhoto(airline) {
  const photoElement = document.getElementById("detail-photo");

  if (!photoElement) return;

  const airlinePhoto = getValue(airline, ["photo", "image"]);

  photoElement.alt = `${airline.name || "Airline"} aircraft`;

   
  photoElement.onerror = () => {
    if (photoElement.src !== DEFAULT_AIRCRAFT_PHOTO) {
      photoElement.src = DEFAULT_AIRCRAFT_PHOTO;
    }
  };

  photoElement.src = airlinePhoto || DEFAULT_AIRCRAFT_PHOTO;
}

async function loadAirlineDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    showError("No airline was selected. Please return to the directory.");
    return;
  }

  try {
     const response = await fetch("./airlines-merged.json");

    if (!response.ok) {
      throw new Error(" Could not load airlines-merged.json");
    }

    const airlines = await response.json();

    const airline = airlines.find(
      (item) =>
        String(item.id) === id ||
        String(item.name).toLowerCase() === id.toLowerCase()
    );

    if (!airline) {
      showError(
        "Airline not found. Please select an airline from the directory."
      );
      return;
    }

    const name = getValue(airline, ["name"]) || "Airline";
    const country = getValue(airline, ["country"]);
    const status = getValue(airline, ["status"]) || "Status unavailable";
    const website = getValue(airline, ["website", "officialWebsite"]);
    const founded = getValue(airline, ["founded", "foundedYear"]);
    const headquarters = getValue(airline, [
      "headquarters",
      "headquarter"
    ]);
    const hub = getValue(airline, ["hub", "mainHub"]);
    const description = getValue(airline, ["description", "overview"]);
    const fleet = getValue(airline, ["fleet", "fleetSize"]);
    const destinations = getValue(airline, [
      "destinations",
      "destinationCount"
    ]);
    const history = getValue(airline, ["history"]);
    const services = getValue(airline, ["services"]);

    document.title = `${name} | Explore Flights`;

    setText("detail-name", name);
    setText("detail-country", country);
    setText("detail-country-fact", country);
    setText("detail-founded", founded);
    setText("detail-headquarters", headquarters);
    setText("detail-hub", hub);
    setText("detail-fleet", fleet);

    setText("detail-destinations", destinations);

    setText(
      "detail-description",
      description,
      `${name} is listed in the Explore Flights airline directory. More verified company information will be added.`
    );

    setText("detail-history", history);
    setText("detail-services", services);

    const statusLabel = document.getElementById("detail-status");

    if (statusLabel) {
      statusLabel.textContent = status;

      const normalizedStatus = status.toLowerCase();

      const isInactive = [
        "not operating",
        "closed",
        "defunct",
        "ceased",
        "inactive"
      ].some((word) => normalizedStatus.includes(word));

      statusLabel.classList.toggle("inactive", isInactive);
    }

    setupAirlineLogo(website);
    setupAircraftPhoto(airline);

    const websiteButton = document.getElementById("official-website");
    const noWebsite = document.getElementById("no-website");
    const websiteNote = document.getElementById("website-note");

    let validWebsite = "";

    if (website) {
      try {
        const parsedWebsite = new URL(website);

        if (
          parsedWebsite.protocol === "https:" ||
          parsedWebsite.protocol === "http:"
        ) {
          validWebsite = parsedWebsite.href;
        }
      } catch {
        validWebsite = "";
      }
    }

    if (websiteButton && noWebsite) {
      if (validWebsite) {
        websiteButton.href = validWebsite;
        websiteButton.hidden = false;
        noWebsite.hidden = true;
      } else {
        websiteButton.hidden = true;
        noWebsite.hidden = false;
      }
    }

    const normalizedStatus = status.toLowerCase();

    const isInactive = [
      "not operating",
      "closed",
      "defunct",
      "ceased",
      "inactive"
    ].some((word) => normalizedStatus.includes(word));

    if (websiteNote && isInactive) {
      websiteNote.textContent =
        "This airline is listed as not currently operating. Historical information and any available website link are provided for reference.";
    }

    loading.hidden = true;
    errorMessage.hidden = true;
    details.hidden = false;
  } catch (error) {
    console.error(error);

    showError(
      "Airline data could not be loaded. Please check airlines.json and Live Server."
    );
  }
}

loadAirlineDetails();
