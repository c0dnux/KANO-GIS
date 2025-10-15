// --- 1. CONFIGURATION (Moved inside the function) ---
const crimeColorMap = {
  Theft: "#FFA500", // Orange
  Assault: "#FF4500", // OrangeRed
  Fraud: "#4682B4", // SteelBlue
  Murder: "#8B0000", // DarkRed
  Kidnapping: "#000000", // Black
  Vandalism: "#8A2BE2", // BlueViolet
  Other: "#808080", // Gray
  Default: "#808080", // Gray as a fallback
};

// --- HELPER FUNCTIONS (Not exported, only used within this file) ---
const createCrimeIcon = (color) => {
  const markerHtml = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>
    </svg>`;
  return L.divIcon({
    html: markerHtml,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// --- MAIN EXPORTED FUNCTION ---
export const initializeCrimeMap = (crimeData) => {
  // Check if a map element exists before running any map code
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // --- 2. MAP INITIALIZATION ---
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.classList.add("dark");
  }

  const map = L.map("map", { zoomControl: false }).setView([12.0, 8.52], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const markers = L.markerClusterGroup();

  // --- 3. UI ELEMENT REFERENCES ---
  const crimeFilterContainer = document.getElementById("crime-type-filter");
  const dateFromInput = document.getElementById("date-from");
  const dateToInput = document.getElementById("date-to");
  const locationSelect = document.getElementById("location");
  const applyBtn = document.getElementById("apply-filters-btn");
  const removeBtn = document.getElementById("remove-filters-btn");
  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const locateBtn = document.getElementById("locate-btn");

  // --- 4. FUNCTIONS ---
  const displayCrimes = (crimes) => {
    markers.clearLayers();
    crimes.forEach((crime) => {
      const color = crimeColorMap[crime.crimeType] || crimeColorMap.Default;
      const icon = createCrimeIcon(color);

      const lat = crime.location.coordinates.coordinates[1];
      const lng = crime.location.coordinates.coordinates[0];

      const marker = L.marker([lat, lng], { icon: icon });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 14px; max-width: 250px;">
          <strong style="font-size: 16px; color: ${color};">${
        crime.crimeType
      }</strong>
          <hr style="margin: 4px 0;">
          <p style="margin: 2px 0;"><strong>Desc:</strong> ${
            crime.description
          }</p>
          <p style="margin: 2px 0;"><strong>Status:</strong> ${crime.status}</p>
          <p style="margin: 2px 0;"><strong>Address:</strong> ${
            crime.location.address
          }, ${crime.location.localGovernment}</p>
          <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(
            crime.date
          ).toLocaleString()}</p>
          <p style="margin: 2px 0;"><strong>Victims:</strong> ${
            crime.victims
          }</p>
        </div>
      `;
      marker.bindPopup(popupContent);
      markers.addLayer(marker);
    });
    map.addLayer(markers);
  };

  const populateCrimeCheckboxes = () => {
    const crimeTypes = [...new Set(crimeData.map((crime) => crime.crimeType))];
    crimeFilterContainer.innerHTML = crimeTypes
      .map((type) => {
        const color = crimeColorMap[type] || crimeColorMap.Default;
        return `
          <div class="flex items-center">
            <input id="type-${type.toLowerCase()}" value="${type}" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary">
            <label for="type-${type.toLowerCase()}" class="ml-2 flex items-center cursor-pointer">
              <span class="h-3 w-3 rounded-full mr-2" style="background-color: ${color};"></span>
              ${type}
            </label>
          </div>
        `;
      })
      .join("");
  };

  const applyFilters = () => {
    const selectedCrimeTypes = Array.from(
      document.querySelectorAll("#crime-type-filter input:checked")
    ).map((input) => input.value);

    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;
    const selectedLocation = locationSelect.value;

    const filteredCrimes = crimeData.filter((crime) => {
      const crimeDate = new Date(crime.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo
        ? new Date(new Date(dateTo).setHours(23, 59, 59, 999))
        : null;

      const typeMatch =
        selectedCrimeTypes.length === 0 ||
        selectedCrimeTypes.includes(crime.crimeType);
      const locationMatch =
        selectedLocation === "All" ||
        crime.location.localGovernment === selectedLocation;
      const dateFromMatch = !fromDate || crimeDate >= fromDate;
      const dateToMatch = !toDate || crimeDate <= toDate;

      return typeMatch && locationMatch && dateFromMatch && dateToMatch;
    });

    displayCrimes(filteredCrimes);
  };

  const removeFilters = () => {
    document
      .querySelectorAll("#crime-type-filter input:checked")
      .forEach((input) => (input.checked = false));
    dateFromInput.value = "";
    dateToInput.value = "";
    locationSelect.value = "All";
    displayCrimes(crimeData);
  };

  // --- 5. EVENT LISTENERS ---
  applyBtn.addEventListener("click", applyFilters);
  removeBtn.addEventListener("click", removeFilters);
  zoomInBtn.addEventListener("click", () => map.zoomIn());
  zoomOutBtn.addEventListener("click", () => map.zoomOut());
  locateBtn.addEventListener("click", () =>
    map.locate({ setView: true, maxZoom: 15 })
  );
  map.on("locationfound", (e) =>
    L.marker(e.latlng).addTo(map).bindPopup("You are here!").openPopup()
  );
  map.on("locationerror", (e) => alert(e.message));

  // --- 6. INITIAL RENDER ---
  populateCrimeCheckboxes();
  displayCrimes(crimeData);
};
