// --- CONFIGURATION ---
const crimeColorMap = {
  Theft: "#FFA500",
  Assault: "#FF4500",
  Fraud: "#4682B4",
  Murder: "#8B0000",
  Kidnapping: "#000000",
  Vandalism: "#8A2BE2",
  Other: "#808080",
  Default: "#808080",
};

const crimeHeatIntensity = {
  Murder: 1.0,
  Kidnapping: 0.9,
  Assault: 0.8,
  Theft: 0.6,
  Fraud: 0.5,
  Vandalism: 0.4,
  Other: 0.3,
};

// --- HELPER FUNCTIONS ---
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

const buildMarkerPopup = (crime, color) => `
  <div style="font-family: sans-serif; font-size: 14px; max-width: 250px;">
    <strong style="font-size: 16px; color: ${color};">${crime.crimeType}</strong>
    <hr style="margin: 4px 0;">
    <p style="margin: 2px 0;"><strong>Desc:</strong> ${crime.description}</p>
    <p style="margin: 2px 0;"><strong>Status:</strong> ${crime.status}</p>
    <p style="margin: 2px 0;"><strong>Address:</strong> ${crime.location.address}, ${crime.location.localGovernment}</p>
    <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(crime.date).toLocaleString()}</p>
    <p style="margin: 2px 0;"><strong>Victims:</strong> ${crime.victims}</p>
  </div>
`;

// --- MAIN EXPORTED FUNCTION ---
export const initializeCrimeMap = (crimeData) => {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  }

  const map = L.map("map", { zoomControl: false }).setView([12.0, 8.52], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // --- UI REFERENCES ---
  const crimeFilterContainer = document.getElementById("crime-type-filter");
  const dateFromInput = document.getElementById("date-from");
  const dateToInput = document.getElementById("date-to");
  const locationSelect = document.getElementById("location");
  const applyBtn = document.getElementById("apply-filters-btn");
  const removeBtn = document.getElementById("remove-filters-btn");
  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const locateBtn = document.getElementById("locate-btn");
  const toggleBtn = document.getElementById("view-toggle-btn");

  // --- BUILD BOTH LAYERS UPFRONT ---
  const markerCluster = L.markerClusterGroup();
  let heatLayer = null;
  let currentMode = "markers";

  const buildFromCrimes = (crimes) => {
    markerCluster.clearLayers();

    const heatData = [];
    crimes.forEach((crime) => {
      const lat = crime.location.coordinates.coordinates[1];
      const lng = crime.location.coordinates.coordinates[0];
      const color = crimeColorMap[crime.crimeType] || crimeColorMap.Default;
      const intensity = crimeHeatIntensity[crime.crimeType] || 0.3;

      // Marker
      const marker = L.marker([lat, lng], { icon: createCrimeIcon(color) });
      marker.bindPopup(buildMarkerPopup(crime, color));
      markerCluster.addLayer(marker);

      // Heat point
      heatData.push([lat, lng, intensity]);
    });

    return heatData;
  };

  const setHeatData = (crimes) => {
    const heatData = [];
    crimes.forEach((crime) => {
      const lat = crime.location.coordinates.coordinates[1];
      const lng = crime.location.coordinates.coordinates[0];
      const intensity = crimeHeatIntensity[crime.crimeType] || 0.3;
      heatData.push([lat, lng, intensity]);
    });
    return heatData;
  };

  // --- SWITCH LAYER ---
  const switchToLayer = (mode, crimes) => {
    // Remove whatever is on the map
    if (map.hasLayer(markerCluster)) map.removeLayer(markerCluster);
    if (heatLayer && map.hasLayer(heatLayer)) {
      map.removeLayer(heatLayer);
      heatLayer = null;
    }

    // Rebuild marker cluster
    markerCluster.clearLayers();
    crimes.forEach((crime) => {
      const lat = crime.location.coordinates.coordinates[1];
      const lng = crime.location.coordinates.coordinates[0];
      const color = crimeColorMap[crime.crimeType] || crimeColorMap.Default;
      const marker = L.marker([lat, lng], { icon: createCrimeIcon(color) });
      marker.bindPopup(buildMarkerPopup(crime, color));
      markerCluster.addLayer(marker);
    });

    // Add the requested layer
    if (mode === "markers") {
      map.addLayer(markerCluster);
    } else {
      // Build fresh heatmap layer (avoids stale internal state)
      const heatData = setHeatData(crimes);
      heatLayer = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        minOpacity: 0.4,
        gradient: {
          0.2: "#0000ff",
          0.4: "#00ffff",
          0.6: "#00ff00",
          0.8: "#ffff00",
          1.0: "#ff0000",
        },
      });
      map.addLayer(heatLayer);
    }
  };

  // --- FILTER LOGIC ---
  const getFilteredCrimes = () => {
    const selectedCrimeTypes = Array.from(
      document.querySelectorAll("#crime-type-filter input:checked")
    ).map((input) => input.value);

    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;
    const selectedLocation = locationSelect.value;

    return crimeData.filter((crime) => {
      const crimeDate = new Date(crime.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(new Date(dateTo).setHours(23, 59, 59, 999)) : null;

      const typeMatch = selectedCrimeTypes.length === 0 || selectedCrimeTypes.includes(crime.crimeType);
      const locationMatch = selectedLocation === "All" || crime.location.localGovernment === selectedLocation;
      const dateFromMatch = !fromDate || crimeDate >= fromDate;
      const dateToMatch = !toDate || crimeDate <= toDate;

      return typeMatch && locationMatch && dateFromMatch && dateToMatch;
    });
  };

  const applyFilters = () => switchToLayer(currentMode, getFilteredCrimes());
  const removeFilters = () => {
    document.querySelectorAll("#crime-type-filter input:checked").forEach((i) => (i.checked = false));
    dateFromInput.value = "";
    dateToInput.value = "";
    locationSelect.value = "All";
    switchToLayer(currentMode, crimeData);
  };

  // --- POPULATE CHECKBOXES ---
  const populateCrimeCheckboxes = () => {
    const crimeTypes = [...new Set(crimeData.map((c) => c.crimeType))];
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

  // --- EVENT LISTENERS ---
  applyBtn.addEventListener("click", applyFilters);
  removeBtn.addEventListener("click", removeFilters);
  zoomInBtn.addEventListener("click", () => map.zoomIn());
  zoomOutBtn.addEventListener("click", () => map.zoomOut());
  locateBtn.addEventListener("click", () => map.locate({ setView: true, maxZoom: 15 }));
  map.on("locationfound", (e) => L.marker(e.latlng).addTo(map).bindPopup("You are here!").openPopup());
  map.on("locationerror", (e) => alert(e.message));

  toggleBtn.addEventListener("click", () => {
    const crimes = getFilteredCrimes();
    if (currentMode === "markers") {
      currentMode = "heatmap";
      toggleBtn.innerHTML = `<span class="material-symbols-outlined text-gray-800 dark:text-gray-200">map</span>`;
      toggleBtn.title = "Switch to Marker View";
    } else {
      currentMode = "markers";
      toggleBtn.innerHTML = `<span class="material-symbols-outlined text-gray-800 dark:text-gray-200">local_fire_department</span>`;
      toggleBtn.title = "Switch to Heatmap View";
    }
    switchToLayer(currentMode, crimes);
  });

  // --- INITIAL RENDER ---
  populateCrimeCheckboxes();
  map.addLayer(markerCluster);
};
