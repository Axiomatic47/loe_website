// src/components/LeafletHeatMap.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Loader2, ZoomIn, ZoomOut, RefreshCw, Maximize, Play, Pause, SkipBack, SkipForward } from "lucide-react";

// Country coordinates for timeline heatmap
const COUNTRY_COORDS = {
  'US': [39.8283, -98.5795],
  'CN': [35.8617, 104.1954],
  'RU': [61.5240, 105.3188],
  'UA': [48.3794, 31.1656],
  'SY': [34.8021, 38.9968],
  'YE': [15.5527, 48.5164],
  'AF': [33.9391, 67.7100],
  'IR': [32.4279, 53.6880],
  'IL': [31.0461, 34.8516],
  'PS': [31.9522, 35.2332],
  'MM': [21.9162, 95.9560],
  'SD': [12.8628, 30.2176],
  'ET': [9.1450, 40.4897],
  'NG': [9.0820, 8.6753],
  'PK': [30.3753, 69.3451],
  'SE': [60.1282, 18.6435],
  'NO': [60.4720, 8.4689],
  'DE': [51.1657, 10.4515],
  'GB': [55.3781, -3.4360],
  'FR': [46.2276, 2.2137],
  'IN': [20.5937, 78.9629],
  'BR': [-14.2350, -51.9253],
  'ZA': [-30.5595, 22.9375],
  'JP': [36.2048, 138.2529],
  'KR': [35.9078, 127.7669],
  'KP': [40.3399, 127.5101],
  'TW': [23.6978, 120.9605],
  'AU': [-25.2744, 133.7751],
  'CA': [56.1304, -106.3468],
  'MX': [23.6345, -102.5528],
  'VE': [6.4238, -66.5897],
  'CO': [4.5709, -74.2973],
  'SA': [23.8859, 45.0792],
  'EG': [26.8206, 30.8025],
  'TR': [38.9637, 35.2433],
  'PL': [51.9194, 19.1451],
  'HU': [47.1625, 19.5033],
};

// This patches Leaflet.heat to fix the canvas warning
const patchLeafletHeat = () => {
  if (!window.L || !window.L.heatLayer) return;

  // Store the original draw method
  const originalDraw = window.L.HeatLayer.prototype._draw;

  // Replace with patched version that sets willReadFrequently
  window.L.HeatLayer.prototype._draw = function() {
    // Ensure canvas context has willReadFrequently set
    if (this._canvas && this._canvas.getContext) {
      const existingContext = this._canvas.getContext('2d');

      // Only recreate context if the attribute isn't already set
      if (!existingContext.willReadFrequently) {
        // Force recreation of context with willReadFrequently
        const canvas = this._canvas;
        const width = canvas.width;
        const height = canvas.height;

        // Create new canvas and copy content
        const newCanvas = document.createElement('canvas');
        newCanvas.width = width;
        newCanvas.height = height;
        const newCtx = newCanvas.getContext('2d', { willReadFrequently: true });

        // Copy attributes from old canvas
        newCanvas.style.cssText = canvas.style.cssText;
        newCanvas.className = canvas.className;

        // Replace old canvas with new one
        if (canvas.parentNode) {
          canvas.parentNode.replaceChild(newCanvas, canvas);
          this._canvas = newCanvas;
        }
      }
    }

    // Call original draw method
    return originalDraw.apply(this, arguments);
  };
};

const LeafletHeatMap = ({
  countries = [],
  events = [],
  timelineData = null,
  simulationData = null,
  onSelectCountry,
  onSelectEvent,
  isLoading = false,
  showGDELT = true,
  showACLED = true,
  showUCDP = true,
  showCountries = true,
  onRequestFullData,
  hasFullData = false
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const countryMarkersRef = useRef([]);
  const eventMarkersRef = useRef([]);
  const simulationMarkersRef = useRef([]);
  const leafletLoadedRef = useRef(false);
  const playIntervalRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showSimulation, setShowSimulation] = useState(true);

  // Timeline state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(-1); // -1 means "current" (no timeline)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  // Event Animation mode state (separate from country SGM timeline)
  const [animationMode, setAnimationMode] = useState('country'); // 'country' or 'events'
  const [eventMonths, setEventMonths] = useState([]); // Months derived from event data
  const [eventMonthIndex, setEventMonthIndex] = useState(0);

  // Stats for display
  const [stats, setStats] = useState({
    visibleCountries: 0,
    visibleEvents: 0,
    gdeltCount: 0,
    acledCount: 0,
    ucdpCount: 0
  });

  // Initialize timeline to most recent month when data loads
  useEffect(() => {
    if (timelineData && timelineData.months && currentMonthIndex === -1) {
      setCurrentMonthIndex(timelineData.months.length - 1);
    }
  }, [timelineData]);

  // Build event months from event data for Event Animation mode
  useEffect(() => {
    if (events && events.length > 0) {
      const months = new Set();
      events.forEach(event => {
        if (event.event_date) {
          const month = event.event_date.substring(0, 7); // "YYYY-MM"
          if (month && month.length === 7 && month.includes('-')) {
            months.add(month);
          }
        }
      });
      const sortedMonths = Array.from(months).sort();
      setEventMonths(sortedMonths);
      console.log(`📅 Built event timeline: ${sortedMonths.length} months from ${sortedMonths[0]} to ${sortedMonths[sortedMonths.length - 1]}`);
      // Start at the beginning for event animation
      if (sortedMonths.length > 0 && eventMonthIndex === 0) {
        setEventMonthIndex(0);
      }
    }
  }, [events]);

  // Load Leaflet and HeatMap plugin scripts dynamically
  useEffect(() => {
    if (leafletLoadedRef.current) return;
    leafletLoadedRef.current = true;

    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(linkElement);

        // Load Leaflet JS
        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletScript.async = true;

        // Load Leaflet heat plugin after Leaflet loads
        leafletScript.onload = () => {
          const heatScript = document.createElement('script');
          heatScript.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
          heatScript.async = true;
          heatScript.onload = () => {
            // Patch Leaflet.heat before setting scriptLoaded
            patchLeafletHeat();
            setScriptLoaded(true);
            console.log("Leaflet and Leaflet.heat loaded successfully");
          };
          document.body.appendChild(heatScript);
        };

        document.body.appendChild(leafletScript);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    loadLeaflet();

    return () => {
      // Cleanup is handled in another useEffect
    };
  }, []);

  // Initialize map once Leaflet is loaded
  useEffect(() => {
    if (!scriptLoaded || !window.L) return;

    if (!mapInstanceRef.current && mapRef.current) {
      const L = window.L;
      console.log("Initializing Leaflet map");

      // Create map with dark theme and restricted bounds
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [10, 0], // Adjust center for better world fit
        zoom: 1.75, // Lower initial zoom to fit the world
        minZoom: 1.5, // Allow zooming out for smaller screens
        maxZoom: 8,
        maxBounds: [[-90, -195], [90, 195]], // Wider bounds
        maxBoundsViscosity: 1.0, // Prevent dragging outside bounds
        worldCopyJump: false, // Disable world copying
        zoomControl: false, // We'll add custom controls
        attributionControl: false, // We'll add our own attribution
        scrollWheelZoom: 'center', // Zoom to cursor position
        zoomDelta: 0.5, // Smoother zoom steps
        zoomSnap: 0.25, // Finer zoom level snapping
        inertia: true, // Enable inertia for smoother panning
      });

      // Add dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      // Add attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: ''
      }).addTo(mapInstanceRef.current);

      // Add custom styles for popups
      addCustomStyles();

      // Fit world bounds
      setTimeout(() => {
        if (mapInstanceRef.current) {
          const worldBounds = L.latLngBounds(
            L.latLng(-60, -170), // Southwest corner (excluding Antarctica)
            L.latLng(75, 170)    // Northeast corner
          );

          mapInstanceRef.current.fitBounds(worldBounds, {
            animate: false,
            padding: [10, 10]
          });
        }
      }, 100);
    }

    // Handle window resize
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [scriptLoaded]);

  // Add custom popup styles
  const addCustomStyles = () => {
    try {
      if (!document.getElementById('custom-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-popup-styles';
        style.innerHTML = `
          .custom-popup .leaflet-popup-content-wrapper {
            background-color: rgba(15, 23, 42, 0.95);
            color: white;
            border-radius: 6px;
            padding: 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .custom-popup .leaflet-popup-tip {
            background-color: rgba(15, 23, 42, 0.95);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          }
          .custom-popup .leaflet-popup-content {
            margin: 14px;
            line-height: 1.5;
          }
          .country-name {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .score-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }
          .score-label {
            color: rgba(255, 255, 255, 0.7);
          }
          .score-value {
            font-weight: 600;
          }
          .category-label {
            font-size: 12px;
            margin-top: 6px;
            color: rgba(255, 255, 255, 0.6);
            text-align: center;
          }
          .event-marker {
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.5);
            text-align: center;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .event-gdelt {
            background-color: rgba(234, 88, 12, 0.8);
            color: white;
          }
          .event-acled {
            background-color: rgba(220, 38, 38, 0.8);
            color: white;
          }
          .event-ucdp {
            background-color: rgba(147, 51, 234, 0.8);
            color: white;
          }

          /* Fix for canvas elements */
          canvas.leaflet-heatmap-layer {
            will-change: contents;
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      console.error("Error adding styles:", error);
    }
  };

  // Get category and color based on SGM score
  const getSGMCategory = (sgm) => {
    if (sgm <= 2) return { category: "Strong Egalitarianism", color: "#3b82f6" };
    if (sgm <= 4) return { category: "Mixed Governance", color: "#22c55e" };
    if (sgm <= 6) return { category: "Soft Supremacism", color: "#eab308" };
    if (sgm <= 8) return { category: "Structural Supremacism", color: "#f97316" };
    return { category: "Extreme Supremacism", color: "#ef4444" };
  };

  // Update heatmap with timeline data for specific month
  const updateHeatmapForMonth = useCallback((monthIndex) => {
    if (!scriptLoaded || !window.L || !mapInstanceRef.current || !timelineData) return;

    const L = window.L;
    const currentMonth = timelineData.months[monthIndex];

    // Remove existing heat layer
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Clear existing country markers (for timeline mode)
    countryMarkersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        marker.remove();
      }
    });
    countryMarkersRef.current = [];

    // Build heat data for current month
    const heatData = [];

    Object.entries(timelineData.countries).forEach(([code, data]) => {
      const coords = COUNTRY_COORDS[code];
      if (!coords) return;

      const monthData = data.timeline.find(t => t.month === currentMonth);
      if (!monthData || monthData.sgm === null) return;

      const [lat, lng] = coords;
      const sgm = monthData.sgm;

      // Scale intensity - higher SGM = more intense red
      // Lower SGM = more intense blue
      let intensity;
      if (sgm <= 5) {
        intensity = (5 - sgm) * 1.4; // Blue scale
      } else {
        intensity = (sgm - 5) * 1.4 + 7; // Red scale
      }

      heatData.push([lat, lng, intensity]);

      // Add clickable marker with detailed popup
      const { category, color } = getSGMCategory(sgm);
      const marker = L.circleMarker([lat, lng], {
        radius: 12,
        fillOpacity: 0,
        opacity: 0,
        interactive: true
      }).addTo(mapInstanceRef.current);

      // Create detailed popup with GDELT metrics
      const popupContent = `
        <div>
          <div class="country-name">${data.name}</div>
          <div style="font-size: 11px; color: ${color}; margin-bottom: 8px; font-weight: 600;">${category}</div>

          <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 4px;">SGM Scoring Data (${currentMonth})</div>

          <div class="score-row">
            <span class="score-label">SGM Score:</span>
            <span class="score-value" style="color: ${color}">${sgm.toFixed(2)}</span>
          </div>

          <div class="score-row">
            <span class="score-label">Goldstein Scale:</span>
            <span class="score-value" style="color: ${monthData.goldstein < 0 ? '#f97316' : '#22c55e'}">${monthData.goldstein?.toFixed(2) || 'N/A'}</span>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 8px 0; padding-top: 8px;">
            <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 4px;">Event Breakdown</div>

            <div class="score-row">
              <span class="score-label">Total Events:</span>
              <span class="score-value">${monthData.events?.toLocaleString() || 0}</span>
            </div>

            <div class="score-row">
              <span class="score-label">Conflict Events:</span>
              <span class="score-value" style="color: #f97316">${monthData.conflict_events?.toLocaleString() || 0}</span>
            </div>

            <div class="score-row">
              <span class="score-label">Conflict Ratio:</span>
              <span class="score-value">${monthData.conflict_ratio ? (monthData.conflict_ratio * 100).toFixed(1) + '%' : 'N/A'}</span>
            </div>

            <div class="score-row">
              <span class="score-label">Violence Events:</span>
              <span class="score-value" style="color: #ef4444">${monthData.violence_events?.toLocaleString() || 0}</span>
            </div>

            <div class="score-row">
              <span class="score-label">Protest Events:</span>
              <span class="score-value" style="color: #a855f7">${monthData.protest_events?.toLocaleString() || 0}</span>
            </div>
          </div>

          <div style="font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 8px; text-align: center;">
            Source: GDELT BigQuery
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-popup',
        maxWidth: 280
      });

      countryMarkersRef.current.push(marker);
    });

    // Create new heat layer
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 50,
      blur: 35,
      maxZoom: 10,
      max: 10,
      minOpacity: 0.6,
      gradient: {
        0.0: '#0000ff',
        0.2: '#2a7fff',
        0.4: '#ffffff',
        0.6: '#ffaa00',
        0.8: '#ff5500',
        1.0: '#ff0000'
      }
    }).addTo(mapInstanceRef.current);
  }, [scriptLoaded, timelineData]);

  // Create and update map layers when data or visibility settings change
  useEffect(() => {
    if (!scriptLoaded || !window.L || !mapInstanceRef.current) return;

    const L = window.L;
    console.log("Updating map layers with data:", {
      countries: countries.length,
      events: events.length,
      showCountries,
      showGDELT,
      showACLED,
      showUCDP,
      hasTimeline: !!timelineData,
      currentMonthIndex,
      animationMode,
      eventMonthIndex,
      eventMonthsCount: eventMonths.length
    });

    // Clear existing event markers first (always do this)
    eventMarkersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        marker.remove();
      }
    });
    eventMarkersRef.current = [];

    // Determine current month based on animation mode
    let currentMonth = null;
    if (animationMode === 'events' && eventMonths.length > 0) {
      // Event Animation mode - use event-derived months
      currentMonth = eventMonths[eventMonthIndex];
    } else if (animationMode === 'country' && timelineData && currentMonthIndex >= 0) {
      // Country SGM mode - use timeline data months
      currentMonth = timelineData.months[currentMonthIndex];
    }

    // Filter the events based on visibility settings AND current month
    const visibleEvents = events.filter(event => {
      if (event.data_source === 'GDELT' && !showGDELT) return false;
      if (event.data_source === 'ACLED' && !showACLED) return false;
      if (event.data_source === 'UCDP' && !showUCDP) return false;

      // If animation is active (either mode), filter events by month
      if (currentMonth && event.event_date) {
        const eventMonth = event.event_date.substring(0, 7); // "YYYY-MM"
        return eventMonth === currentMonth;
      }
      return true;
    });

    // Count by source for stats (use visible events for current month if timeline active)
    const gdeltCount = visibleEvents.filter(e => e.data_source === 'GDELT').length;
    const acledCount = visibleEvents.filter(e => e.data_source === 'ACLED').length;
    const ucdpCount = visibleEvents.filter(e => e.data_source === 'UCDP').length;

    console.log(`📍 Adding ${visibleEvents.length} event markers (UCDP: ${ucdpCount}, GDELT: ${gdeltCount}, ACLED: ${acledCount})`);

    // Add event markers (always, regardless of timeline mode)
    if (visibleEvents.length > 0) {
      addEventMarkers(visibleEvents);
    }

    // If we have timeline data and a valid month index, use timeline rendering for countries
    if (timelineData && currentMonthIndex >= 0) {
      updateHeatmapForMonth(currentMonthIndex);

      // Update stats based on timeline data
      const currentMonth = timelineData.months[currentMonthIndex];
      let countryCount = 0;
      Object.entries(timelineData.countries).forEach(([code, data]) => {
        const monthData = data.timeline.find(t => t.month === currentMonth);
        if (monthData && monthData.sgm !== null) countryCount++;
      });

      setStats({
        visibleCountries: countryCount,
        visibleEvents: visibleEvents.length,
        gdeltCount,
        acledCount,
        ucdpCount
      });
      return;
    }

    // Otherwise use the original country data rendering

    try {
      // Clear existing layers
      if (heatLayerRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      // Clear country markers
      countryMarkersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          marker.remove();
        }
      });
      countryMarkersRef.current = [];

      // Update stats (events already added above)
      setStats({
        visibleCountries: showCountries ? countries.length : 0,
        visibleEvents: visibleEvents.length,
        gdeltCount,
        acledCount,
        ucdpCount
      });

      // Add country heatmap if countries should be displayed
      if (showCountries && countries.length > 0) {
        addCountryHeatmap(countries);
      }

      // Add simulation markers if simulation data is available
      if (showSimulation && simulationData && simulationData.results && simulationData.results.length > 0) {
        addSimulationMarkers(simulationData.results);
      } else {
        // Clear simulation markers if disabled
        simulationMarkersRef.current.forEach(marker => {
          if (mapInstanceRef.current) {
            marker.remove();
          }
        });
        simulationMarkersRef.current = [];
      }

    } catch (error) {
      console.error('Error updating map layers:', error);
    }
  }, [countries, events, scriptLoaded, showCountries, showGDELT, showACLED, showUCDP, timelineData, currentMonthIndex, updateHeatmapForMonth, animationMode, eventMonthIndex, eventMonths, simulationData, showSimulation]);

  // Handle timeline playback for both modes
  useEffect(() => {
    if (!isPlaying) return;

    // Event Animation mode
    if (animationMode === 'events' && eventMonths.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setEventMonthIndex(prev => {
          if (prev >= eventMonths.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    // Country SGM mode
    else if (animationMode === 'country' && timelineData) {
      playIntervalRef.current = setInterval(() => {
        setCurrentMonthIndex(prev => {
          if (prev >= timelineData.months.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, timelineData, playbackSpeed, animationMode, eventMonths]);

  // Add country heatmap layer
  const addCountryHeatmap = (countries) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    try {
      // Prepare heat data points
      const heatData = countries.map(country => {
        const lat = country.latitude || 0;
        const lng = country.longitude || 0;

        // Skip countries without coordinates
        if (lat === 0 || lng === 0) return null;

        // Get the intensity value
        const rawIntensity = country.sgm || country.gscs || 0;

        // Scale intensity based on value:
        // - For egalitarianism (0-5), scale higher for blue side
        // - For supremacism (5-10), scale higher for red side
        let intensity = rawIntensity <= 5
          ? (5 - rawIntensity) * 1.4  // Blue scale (egalitarianism)
          : (rawIntensity - 5) * 1.4 + 7; // Red scale (supremacism)

        // Return [lat, lng, intensity]
        return [lat, lng, intensity];
      }).filter(Boolean); // Remove null entries

      // Create heat layer with custom gradient
      const heatOptions = {
        radius: 40, // Larger radius for better visibility
        blur: 30, // More blur for smoother gradients
        maxZoom: 10,
        max: 10,
        minOpacity: 0.5,
        gradient: {
          0.0: '#0000ff', // Deep blue - egalitarianism
          0.2: '#2a7fff', // Light blue - moderate egalitarianism
          0.4: '#ffffff', // White - neutral
          0.6: '#ffaa00', // Orange - moderate supremacism
          0.8: '#ff5500', // Orange-red - strong supremacism
          1.0: '#ff0000'  // Deep red - extreme supremacism
        }
      };

      heatLayerRef.current = L.heatLayer(heatData, heatOptions).addTo(mapInstanceRef.current);

      // Add clickable markers on top of the heatmap
      countries.forEach(country => {
        const lat = country.latitude || 0;
        const lng = country.longitude || 0;

        if (lat === 0 || lng === 0) return;

        // Create a transparent marker for clicking
        const marker = L.circleMarker([lat, lng], {
          radius: 12,
          fillOpacity: 0,
          opacity: 0,
          interactive: true
        }).addTo(mapInstanceRef.current);

        // Get country name
        const countryName = country.country || country.name || country.code;

        // Get category based on SGM score
        const getCategory = (score) => {
          if (score <= 2) return "Strong Egalitarianism";
          if (score <= 4) return "Mixed Governance";
          if (score <= 6) return "Soft Supremacism";
          if (score <= 8) return "Structural Supremacism";
          return "Extreme Supremacism";
        };

        // Add popup with country info
        marker.bindPopup(`
          <div>
            <div class="country-name">${countryName}</div>
            <div class="score-row">
              <span class="score-label">SGM Score:</span>
              <span class="score-value">${(country.sgm || country.gscs).toFixed(1)}</span>
            </div>
            ${country.srsD ? `
            <div class="score-row">
              <span class="score-label">Domestic:</span>
              <span class="score-value">${country.srsD.toFixed(1)}</span>
            </div>
            ` : ''}
            ${country.srsI ? `
            <div class="score-row">
              <span class="score-label">International:</span>
              <span class="score-value">${country.srsI.toFixed(1)}</span>
            </div>
            ` : ''}
            <div class="category-label">${getCategory(country.sgm || country.gscs)}</div>
          </div>
        `, {
          className: 'custom-popup',
          maxWidth: 220
        });

        // Handle click event
        marker.on('click', () => {
          if (onSelectCountry) {
            onSelectCountry(country);
          }
        });

        countryMarkersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Error creating country heatmap:', error);
    }
  };

  // Add event markers
  const addEventMarkers = (events) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    try {
      events.forEach(event => {
        const lat = event.latitude || 0;
        const lng = event.longitude || 0;

        if (lat === 0 || lng === 0) return;

        // Create a custom icon based on the data source
        const icon = L.divIcon({
          className: `event-marker event-${event.data_source?.toLowerCase() || 'gdelt'}`,
          iconSize: [16, 16],
          html: ''
        });

        const marker = L.marker([lat, lng], {
          icon: icon,
          interactive: true
        }).addTo(mapInstanceRef.current);

        // Prepare event info for popup
        const eventType = event.event_type || 'Conflict Event';
        const location = event.location || event.country || 'Unknown';
        const date = event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Unknown date';
        const description = event.description || 'No description available';

        // Add popup with event info
        marker.bindPopup(`
          <div>
            <div class="country-name">${eventType}</div>
            <div class="score-row">
              <span class="score-label">Location:</span>
              <span class="score-value">${location}</span>
            </div>
            <div class="score-row">
              <span class="score-label">Date:</span>
              <span class="score-value">${date}</span>
            </div>
            <div class="score-row">
              <span class="score-label">Details:</span>
            </div>
            <div style="font-size: 12px; margin-top: 4px; color: rgba(255,255,255,0.8);">
              ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}
            </div>
            <div class="category-label">${event.data_source || 'GDELT'} Event</div>
          </div>
        `, {
          className: 'custom-popup',
          maxWidth: 250
        });

        // Handle click event
        marker.on('click', () => {
          if (onSelectEvent) {
            onSelectEvent(event);
          }
        });

        eventMarkersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Error adding event markers:', error);
    }
  };

  // Add simulation result markers
  const addSimulationMarkers = (results) => {
    if (!mapInstanceRef.current || !window.L || !results || results.length === 0) return;
    const L = window.L;

    try {
      // Clear existing simulation markers
      simulationMarkersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          marker.remove();
        }
      });
      simulationMarkersRef.current = [];

      console.log(`🔬 Adding ${results.length} simulation markers`);

      results.forEach(result => {
        const lat = result.latitude || 0;
        const lng = result.longitude || 0;

        if (lat === 0 || lng === 0) return;

        // Get color based on risk level
        const getRiskColor = (level) => {
          switch (level) {
            case 'low': return '#22c55e';
            case 'moderate': return '#84cc16';
            case 'elevated': return '#eab308';
            case 'high': return '#f97316';
            case 'critical': return '#ef4444';
            default: return '#6b7280';
          }
        };

        const color = getRiskColor(result.simulation.risk_level);
        const coherence = result.simulation.final_coherence;

        // Create a pulsing marker for simulation results
        const pulseSize = 24 + (1 - coherence) * 16; // Larger for lower coherence
        const icon = L.divIcon({
          className: 'simulation-marker',
          iconSize: [pulseSize, pulseSize],
          html: `
            <div style="
              width: ${pulseSize}px;
              height: ${pulseSize}px;
              background: radial-gradient(circle, ${color}88 0%, ${color}00 70%);
              border: 2px solid ${color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: pulse 2s ease-in-out infinite;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: ${color};
                border-radius: 50%;
              "></div>
            </div>
          `
        });

        const marker = L.marker([lat, lng], {
          icon: icon,
          interactive: true,
          zIndexOffset: 1000 // On top of other markers
        }).addTo(mapInstanceRef.current);

        // Build coherence change arrow
        const changeArrow = result.simulation.coherence_change > 0 ? '↑' : '↓';
        const changeColor = result.simulation.coherence_change > 0 ? '#22c55e' : '#ef4444';

        // Create detailed popup with simulation data
        const popupContent = `
          <div style="min-width: 260px;">
            <div class="country-name">${result.country_code}</div>
            <div style="font-size: 11px; color: ${color}; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;">
              ${result.simulation.risk_level} Risk
            </div>

            <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; margin-bottom: 8px;">
              <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 4px;">Primordial Coherence</div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 24px; font-weight: bold; color: ${color}">
                  ${(coherence * 100).toFixed(1)}%
                </span>
                <span style="font-size: 14px; color: ${changeColor}">
                  ${changeArrow} ${Math.abs(result.simulation.coherence_change * 100).toFixed(1)}%
                </span>
              </div>
              <div style="font-size: 10px; color: rgba(255,255,255,0.4);">
                Initial: ${(result.simulation.initial_coherence * 100).toFixed(1)}%
              </div>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
              <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 4px;">Simulation Parameters</div>

              <div class="score-row">
                <span class="score-label">Suppression:</span>
                <span class="score-value" style="color: ${result.parameters.suppression_level > 0.5 ? '#f97316' : '#22c55e'}">
                  ${(result.parameters.suppression_level * 100).toFixed(0)}%
                </span>
              </div>

              <div class="score-row">
                <span class="score-label">Ideology:</span>
                <span class="score-value" style="color: ${result.parameters.supremacist_ideology > 0.5 ? '#f97316' : '#22c55e'}">
                  ${(result.parameters.supremacist_ideology * 100).toFixed(0)}%
                </span>
              </div>

              <div class="score-row">
                <span class="score-label">Fear Factor:</span>
                <span class="score-value" style="color: ${result.parameters.fear_factor > 0.5 ? '#ef4444' : '#eab308'}">
                  ${(result.parameters.fear_factor * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 8px; padding-top: 8px;">
              <div class="score-row">
                <span class="score-label">Events Processed:</span>
                <span class="score-value">${result.source_data.event_count.toLocaleString()}</span>
              </div>
              <div class="score-row">
                <span class="score-label">Total Fatalities:</span>
                <span class="score-value" style="color: #ef4444">${result.source_data.total_fatalities.toLocaleString()}</span>
              </div>
              <div class="score-row">
                <span class="score-label">Date Range:</span>
                <span class="score-value" style="font-size: 10px;">${result.source_data.date_range[0]} to ${result.source_data.date_range[1]}</span>
              </div>
            </div>

            <div style="font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 8px; text-align: center;">
              Laws of Existence Framework v${result.metadata.framework_version}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: 'custom-popup',
          maxWidth: 300
        });

        simulationMarkersRef.current.push(marker);
      });

      // Add CSS animation for pulsing if not already added
      if (!document.getElementById('simulation-marker-styles')) {
        const style = document.createElement('style');
        style.id = 'simulation-marker-styles';
        style.innerHTML = `
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          .simulation-marker {
            background: transparent !important;
            border: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      console.error('Error adding simulation markers:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (heatLayerRef.current) {
        heatLayerRef.current = null;
      }

      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }

      countryMarkersRef.current = [];
      eventMarkersRef.current = [];
      simulationMarkersRef.current = [];
    };
  }, []);

  // Reset view function
  const handleResetView = useCallback(() => {
    if (!mapInstanceRef.current || !window.L) return;

    try {
      const L = window.L;
      const worldBounds = L.latLngBounds(
        L.latLng(-60, -170), // Southwest corner (excluding Antarctica)
        L.latLng(75, 170)    // Northeast corner (excluding northernmost areas)
      );

      mapInstanceRef.current.fitBounds(worldBounds, {
        animate: true,
        duration: 0.75,
        padding: [10, 10]
      });
    } catch (error) {
      console.error("Error resetting view:", error);
    }
  }, []);

  // Handle zoom in function
  const handleZoomIn = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom + 0.5, { animate: true });
  }, []);

  // Handle zoom out function
  const handleZoomOut = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom - 0.5, { animate: true });
  }, []);

  // Fullscreen toggle function
  const toggleFullscreen = useCallback(() => {
    try {
      const mapContainer = mapRef.current;
      if (!mapContainer) return;

      if (!document.fullscreenElement) {
        if (mapContainer.requestFullscreen) {
          mapContainer.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
        } else if (mapContainer.webkitRequestFullscreen) {
          mapContainer.webkitRequestFullscreen();
        } else if (mapContainer.msRequestFullscreen) {
          mapContainer.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(err => console.error("Exit fullscreen error:", err));
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Fullscreen toggle error:", error);
    }
  }, []);

  // Timeline playback controls - handle both modes
  const handlePlayPause = () => {
    if (animationMode === 'events') {
      if (eventMonths.length === 0) return;
      if (eventMonthIndex >= eventMonths.length - 1) {
        setEventMonthIndex(0);
      }
    } else {
      if (!timelineData) return;
      if (currentMonthIndex >= timelineData.months.length - 1) {
        setCurrentMonthIndex(0);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (animationMode === 'events') {
      setEventMonthIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentMonthIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (animationMode === 'events') {
      setEventMonthIndex(prev => Math.min(eventMonths.length - 1, prev + 1));
    } else if (timelineData) {
      setCurrentMonthIndex(prev => Math.min(timelineData.months.length - 1, prev + 1));
    }
  };

  const handleSliderChange = (value) => {
    setIsPlaying(false);
    if (animationMode === 'events') {
      setEventMonthIndex(value[0]);
    } else {
      setCurrentMonthIndex(value[0]);
    }
  };

  // Get current month label based on mode
  const currentMonthLabel = animationMode === 'events'
    ? (eventMonths.length > 0 ? eventMonths[eventMonthIndex] : 'No Data')
    : (timelineData && currentMonthIndex >= 0 ? timelineData.months[currentMonthIndex] : 'Current');

  // Get current timeline data for slider
  const activeMonths = animationMode === 'events' ? eventMonths : (timelineData?.months || []);
  const activeMonthIndex = animationMode === 'events' ? eventMonthIndex : currentMonthIndex;

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Global Conflict & Supremacism Map</h3>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            onClick={handleZoomIn}
            disabled={!scriptLoaded}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            onClick={handleZoomOut}
            disabled={!scriptLoaded}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            onClick={handleResetView}
            disabled={!scriptLoaded}
            title="Reset View"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            onClick={toggleFullscreen}
            disabled={!scriptLoaded}
            title="Fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-96 md:h-[450px] lg:h-[500px] rounded-lg overflow-hidden shadow-lg">
        <div
          ref={mapRef}
          className="h-full w-full bg-gray-900 relative"
          id="map-container"
          style={{ willChange: 'transform', willReadFrequently: true }}
        />

        {(isLoading || !scriptLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm pointer-events-none z-50">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
              <p className="text-white">Loading map data...</p>
            </div>
          </div>
        )}

        {/* Month overlay when timeline/animation is active */}
        {activeMonths.length > 0 && (
          <div className="absolute top-4 left-4 bg-black/80 px-4 py-2 rounded-lg border border-white/20 z-20">
            <div className="text-2xl font-bold text-white">{currentMonthLabel}</div>
            <div className="text-xs text-gray-400">
              {isPlaying ? 'Playing...' : (animationMode === 'events' ? 'Event Animation' : 'Country SGM')}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Playback Controls - Dual Mode */}
      {(timelineData?.months?.length > 0 || eventMonths.length > 0) && (
        <div className="mt-3 p-3 bg-black/40 rounded-lg border border-gray-800">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Animation Mode:</span>
              <select
                value={animationMode}
                onChange={(e) => {
                  setIsPlaying(false);
                  const newMode = e.target.value;
                  setAnimationMode(newMode);
                  // Request full data when switching to events mode
                  if (newMode === 'events' && !hasFullData && onRequestFullData) {
                    onRequestFullData();
                  }
                }}
                className="bg-black/50 text-white border border-white/20 rounded px-2 py-1 text-xs"
              >
                <option value="country">Country SGM ({timelineData?.months?.length || 0} months)</option>
                <option value="events">
                  Event Animation ({eventMonths.length} months){!hasFullData && eventMonths.length < 100 ? ' - Click to load full data' : ''}
                </option>
              </select>
              {animationMode === 'events' && !hasFullData && (
                <span className="text-xs text-yellow-400">(Loading recent data only)</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {animationMode === 'events'
                ? `Events: ${activeMonths[0] || 'N/A'} → ${activeMonths[activeMonths.length - 1] || 'N/A'}`
                : `SGM: ${timelineData?.months?.[0] || 'N/A'} → ${timelineData?.months?.[timelineData?.months?.length - 1] || 'N/A'}`
              }
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleStepBack}
              disabled={activeMonthIndex === 0}
              className="bg-black/50 text-white border-white/20 hover:bg-black/70 h-8 w-8"
              title="Previous Month"
            >
              <SkipBack className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
              disabled={activeMonths.length === 0}
              className="bg-black/50 text-white border-white/20 hover:bg-black/70 h-10 w-10"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleStepForward}
              disabled={activeMonthIndex >= activeMonths.length - 1}
              className="bg-black/50 text-white border-white/20 hover:bg-black/70 h-8 w-8"
              title="Next Month"
            >
              <SkipForward className="h-3 w-3" />
            </Button>

            <div className="flex-1 px-2">
              <Slider
                value={[activeMonthIndex >= 0 ? activeMonthIndex : 0]}
                min={0}
                max={Math.max(0, activeMonths.length - 1)}
                step={1}
                onValueChange={handleSliderChange}
                className="cursor-pointer"
                disabled={activeMonths.length === 0}
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{activeMonths[0] || 'N/A'}</span>
                <span>{activeMonths[Math.floor(activeMonths.length / 2)] || ''}</span>
                <span>{activeMonths[activeMonths.length - 1] || 'N/A'}</span>
              </div>
            </div>

            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-black/50 text-white border border-white/20 rounded px-2 py-1 text-xs"
              title="Playback Speed"
            >
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
            </select>
          </div>
        </div>
      )}

      {/* Map stats and legend */}
      <div className="mt-3 p-3 bg-black/40 rounded-lg border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SGM Color Scale */}
          <div className="col-span-2">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-400">Egalitarianism</span>
              <span className="text-xs text-gray-400">Supremacism</span>
            </div>
            <div className="h-3 w-full rounded-full" style={{background: 'linear-gradient(to right, #0000ff, #2a7fff, #ffffff, #ffaa00, #ff5500, #ff0000)'}}></div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-300">0</span>
              <span className="text-xs text-gray-300">2</span>
              <span className="text-xs text-gray-300">4</span>
              <span className="text-xs text-gray-300">6</span>
              <span className="text-xs text-gray-300">8</span>
              <span className="text-xs text-gray-300">10</span>
            </div>
          </div>

          {/* Event sources legend */}
          <div className="flex flex-col justify-center md:justify-start items-center md:items-start">
            <div className="text-xs text-gray-400 mb-2">Event Sources:</div>
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-600 rounded-full mr-1"></div>
                <span className="text-xs text-gray-300">UCDP ({stats.ucdpCount})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-600 rounded-full mr-1"></div>
                <span className="text-xs text-gray-300">GDELT ({stats.gdeltCount})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
                <span className="text-xs text-gray-300">ACLED ({stats.acledCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation Results Legend */}
        {simulationData && simulationData.results && simulationData.results.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Simulation Results:</span>
                <span className="text-xs text-purple-400">({simulationData.results.length} countries)</span>
              </div>
              <button
                onClick={() => setShowSimulation(!showSimulation)}
                className={cn(
                  "text-xs px-2 py-1 rounded transition-colors",
                  showSimulation
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                    : "bg-gray-700/30 text-gray-400 border border-gray-600/50"
                )}
              >
                {showSimulation ? 'Hide' : 'Show'}
              </button>
            </div>
            {showSimulation && (
              <div className="flex items-center space-x-4 flex-wrap gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{background: 'radial-gradient(circle, #22c55e88 0%, transparent 70%)', border: '1px solid #22c55e'}}></div>
                  <span className="text-xs text-gray-300">Low Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{background: 'radial-gradient(circle, #eab30888 0%, transparent 70%)', border: '1px solid #eab308'}}></div>
                  <span className="text-xs text-gray-300">Elevated</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{background: 'radial-gradient(circle, #f9731688 0%, transparent 70%)', border: '1px solid #f97316'}}></div>
                  <span className="text-xs text-gray-300">High</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{background: 'radial-gradient(circle, #ef444488 0%, transparent 70%)', border: '1px solid #ef4444'}}></div>
                  <span className="text-xs text-gray-300">Critical</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data stats */}
        <div className="text-xs text-gray-400 text-center mt-2">
          {animationMode === 'events' && eventMonths.length > 0 ? (
            <>
              Event Animation: {currentMonthLabel} — {stats.visibleEvents} events
              (UCDP: {stats.ucdpCount}, ACLED: {stats.acledCount}, GDELT: {stats.gdeltCount})
            </>
          ) : timelineData && currentMonthIndex >= 0 ? (
            <>
              Country SGM: {currentMonthLabel} ({stats.visibleCountries} countries, {stats.visibleEvents} events)
            </>
          ) : (
            <>
              {stats.visibleCountries > 0 && stats.visibleEvents > 0 && (
                <>
                  Showing data from {stats.visibleCountries} countries and {stats.visibleEvents} events
                  {showGDELT && !showACLED && !showUCDP && " (GDELT only)"}
                  {!showGDELT && showACLED && !showUCDP && " (ACLED only)"}
                  {!showGDELT && !showACLED && showUCDP && " (UCDP only)"}
                </>
              )}
              {stats.visibleCountries > 0 && stats.visibleEvents === 0 && (
                <>Showing data from {stats.visibleCountries} countries</>
              )}
              {stats.visibleCountries === 0 && stats.visibleEvents > 0 && (
                <>Showing {stats.visibleEvents} conflict events</>
              )}
              {stats.visibleCountries === 0 && stats.visibleEvents === 0 && (
                <>No data to display</>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

LeafletHeatMap.propTypes = {
  countries: PropTypes.array,
  events: PropTypes.array,
  timelineData: PropTypes.object,
  simulationData: PropTypes.object,
  onSelectCountry: PropTypes.func,
  onSelectEvent: PropTypes.func,
  isLoading: PropTypes.bool,
  showGDELT: PropTypes.bool,
  showACLED: PropTypes.bool,
  showUCDP: PropTypes.bool,
  showCountries: PropTypes.bool,
  onRequestFullData: PropTypes.func,
  hasFullData: PropTypes.bool
};

export default LeafletHeatMap;
