"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LocationPayload } from "@/lib/types";
import { isBareCoordinates } from "@/lib/utils";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const DEFAULT_CENTER = { lat: 11.005, lng: 124.877 }; // Region 8 (Eastern Visayas)
const DEFAULT_ZOOM = 12;
const CALLBACK_NAME = "__sr8LocationInit";
const LOAD_TIMEOUT_MS = 20000;

/* ----------------------------------------------------------------------------
 * Minimal but sufficient typings for the subset of the Google Maps JS API we
 * use. Keeping these local (instead of @types/google.maps) avoids a dependency
 * and keeps the full, correct API available through `window.google`.
 * -------------------------------------------------------------------------- */

interface LatLng {
  lat(): number;
  lng(): number;
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface MapOptions {
  center: LatLngLiteral;
  zoom: number;
  mapTypeId?: string;
}

interface MapInstance {
  panTo(p: LatLngLiteral): void;
  setCenter(p: LatLngLiteral): void;
}

interface PlaceResult {
  formatted_address?: string;
  name?: string;
  place_id?: string;
  geometry?: { location: LatLng };
  address_components?: AddressComponent[];
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocoderResult {
  formatted_address: string;
  place_id?: string;
}

interface GeocoderInstance {
  geocode(
    request: Record<string, unknown>,
    callback: (results: GeocoderResult[], status: string) => void
  ): void;
}

interface AutocompleteInstance {
  addListener(event: string, handler: () => void): void;
  getPlace(): PlaceResult;
}

interface AutocompleteOptions {
  componentRestrictions: { country: string };
  fields: string[];
}

interface MarkerInstance {
  setMap(m: unknown): void;
  setPosition(p: LatLngLiteral): void;
  getPosition(): LatLng;
  addListener(event: string, handler: () => void): void;
}

interface MapsNamespace {
  Map: new (el: HTMLElement, opts: MapOptions) => MapInstance;
  Marker: new (opts: { map: MapInstance; position: LatLngLiteral; draggable?: boolean }) => MarkerInstance;
  Geocoder: new () => GeocoderInstance;
  places: {
    Autocomplete: new (input: HTMLInputElement, opts: AutocompleteOptions) => AutocompleteInstance;
  };
}

declare global {
  interface Window {
    google?: { maps?: MapsNamespace };
    __sr8LocationInit?: () => void;
  }
}

interface LocationPickerProps {
  /** Current value (e.g. from an edit form). */
  value?: Partial<LocationPayload>;
  /** Fired on every meaningful location change (place select, drag, geolocate). */
  onChange?: (location: LocationPayload) => void;
  /** Optional override; defaults to NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. */
  apiKey?: string;
  /** Country restriction for the Places Autocomplete suggestions. */
  countryRestriction?: string;
  className?: string;
}

/** Result of a reverse geocode lookup. */
interface ReverseGeocodeResult {
  address: string;
  placeId?: string;
  /** Raw Google Geocoder status string, so callers can show a helpful error. */
  status?: string;
}

/* ----------------------------------------------------------------------------
 * Singleton script loader so multiple forms sharing the page only fetch the
 * Google Maps bootstrap once, and the load resolves (or rejects) predictably.
 * -------------------------------------------------------------------------- */

let scriptPromise: Promise<MapsNamespace> | null = null;
let scriptTimer: ReturnType<typeof setTimeout> | null = null;

function loadGoogleMaps(apiKey: string): Promise<MapsNamespace> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const finish = (fn: () => void) => {
      if (scriptTimer) {
        clearTimeout(scriptTimer);
        scriptTimer = null;
      }
      fn();
    };

    // Already present on the page (loaded by an earlier instance).
    const alreadyLoaded = window.google?.maps;
    if (alreadyLoaded) {
      finish(() => resolve(alreadyLoaded));
      return;
    }

    const existing = document.getElementById("gmaps-script") as HTMLScriptElement | null;
    if (existing) {
      // If the script already finished loading, use it now; otherwise wait.
      const loaded = window.google?.maps;
      if (loaded) {
        finish(() => resolve(loaded));
        return;
      }
      existing.addEventListener("load", () => {
        const m = window.google?.maps;
        finish(() => (m ? resolve(m) : reject(new Error("Google Maps failed to load"))));
      });
      existing.addEventListener("error", () => {
        scriptPromise = null;
        finish(() => reject(new Error("Google Maps script failed to load")));
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      scriptPromise = null;
      finish(() => reject(new Error("Google Maps script failed to load")));
    };

    // Use a single named global so the URL callback matches the defined handler.
    window[CALLBACK_NAME] = () => {
      const m = window.google?.maps;
      finish(() =>
        m ? resolve(m) : reject(new Error("Google Maps API loaded without the maps library"))
      );
    };

    // Safety net: if the bootstrap never fires (bad key, blocked referrer, etc.),
    // surface an actionable error instead of hanging on "loading…" forever.
    scriptTimer = setTimeout(() => {
      scriptPromise = null;
      reject(
        new Error(
          "Google Maps timed out. Check the API key and that Maps JavaScript API is enabled."
        )
      );
    }, LOAD_TIMEOUT_MS);

    document.head.appendChild(script);
  });

  return scriptPromise;
}

/** Reverse geocode a lat/lng into a formatted address + optional place id. */
async function reverseGeocode(
  maps: MapsNamespace,
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  return new Promise((resolve) => {
    const geocoder = new maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        resolve({
          address: results[0].formatted_address || "",
          placeId: results[0].place_id,
          status,
        });
      } else {
        resolve({ address: "", status });
      }
    });
  });
}

/** Human-readable message for a failed reverse geocode, keyed by the actual
 * Geocoder status code so the cause is obvious instead of a generic note. */
function buildGeocodeError(status?: string): string {
  switch (status) {
    case "REQUEST_DENIED":
      return "Location lookup was denied by Google — the Geocoding API may not be enabled for this API key.";
    case "OVER_QUERY_LIMIT":
      return "Location lookup hit the query limit for this API key. Try again in a moment.";
    case "ZERO_RESULTS":
      return "No address found at this spot — enter the address manually.";
    default:
      return status
        ? `Couldn't resolve an address here (${status}) — the coordinates were saved, please enter the address manually.`
        : "Couldn't resolve an address here — the coordinates were saved, please enter the address manually.";
  }
}

export default function LocationPicker({
  value,
  onChange,
  apiKey = API_KEY,
  countryRestriction = "PH",
}: LocationPickerProps) {
  const [maps, setMaps] = useState<MapsNamespace | null>(null);
  const [loadError, setLoadError] = useState<string>("");
  const [showMap, setShowMap] = useState<boolean>(() => !!(value?.lat && value?.lng));
  const [locating, setLocating] = useState<boolean>(false);
  const [geocodeError, setGeocodeError] = useState<string>("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const markerRef = useRef<MarkerInstance | null>(null);
  const autocompleteRef = useRef<AutocompleteInstance | null>(null);

  const center = {
    lat: value?.lat ? Number(value.lat) : DEFAULT_CENTER.lat,
    lng: value?.lng ? Number(value.lng) : DEFAULT_CENTER.lng,
  };

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // ---- Load the API once ----------------------------------------------------
  useEffect(() => {
    if (!apiKey) {
      setLoadError("No Google Maps API key configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      return;
    }
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then((m) => {
        if (!cancelled) setMaps(m);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  // ---- Initialize the Autocomplete bound to the input -----------------------
  useEffect(() => {
    if (!maps || !inputRef.current || autocompleteRef.current) return;
    const autocomplete = new maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: countryRestriction },
      fields: ["formatted_address", "name", "place_id", "geometry", "address_components"],
    });
    autocompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place?.geometry?.location) {
        setGeocodeError("Address not found — drag the pin or use “Locate me”.");
        return;
      }
      setGeocodeError("");
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const payload: LocationPayload = {
        address: place.formatted_address || place.name || value?.address || "",
        lat,
        lng,
        placeId: place.place_id,
      };
      setShowMap(true);
      if (mapRef.current) mapRef.current.panTo({ lat, lng });
      markerRef.current?.setPosition({ lat, lng });
      onChangeRef.current?.(payload);
    });
  }, [maps, countryRestriction, value?.address]);

  /* ---- Create the map + draggable marker ------------------------------------ */
  const mapCreatedRef = useRef(false);
  useEffect(() => {
    if (!maps || !showMap || !mapDivRef.current) return;
    if (mapCreatedRef.current) return;
    mapCreatedRef.current = true;

    const map = new maps.Map(mapDivRef.current, {
      center,
      zoom: DEFAULT_ZOOM,
      mapTypeId: "roadmap",
    });
    mapRef.current = map;

    const marker = new maps.Marker({ map, position: center, draggable: true });
    markerRef.current = marker;

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      const lat = pos.lat();
      const lng = pos.lng();
      const input = inputRef.current;

      // Capture the coordinates right away so a drag is never lost — the
      // geocoder only *refines* the address afterwards. Prefer the reverse
      // geocoder's real address over a bare lat/lng string in the input.
      onChangeRef.current?.({
        address: (input && input.value) || value?.address || "",
        lat,
        lng,
      });

      void reverseGeocode(maps, lat, lng).then(({ address, placeId, status }) => {
        if (!address) {
          setGeocodeError(buildGeocodeError(status));
          return;
        }
        setGeocodeError("");
        if (input) input.value = address;
        onChangeRef.current?.({ address, lat, lng, placeId });
      });
    });

    return () => {
      marker.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
      mapCreatedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maps, showMap]);

  /* ---- Re-center the map if the parent value changes externally -------------- */
  useEffect(() => {
    if (!maps || !mapRef.current || !value?.lat || !value?.lng) return;
    const next = { lat: Number(value.lat), lng: Number(value.lng) };
    mapRef.current.panTo(next);
    markerRef.current?.setPosition(next);
  }, [maps, value?.lat, value?.lng]);

  /* ---- Upgrade a stale bare-coordinate address to a real one on load ---------
   * Older saves could store "11.19,125.01" as the address. When we have real
   * coordinates, resolve them back to a human-readable address so the input
   * never just shows lat/lng. Runs once per location after Maps is ready. */
  const upgradedRef = useRef(false);
  useEffect(() => {
    if (!maps || upgradedRef.current) return;
    if (!value?.lat || !value?.lng) return;
    if (!isBareCoordinates(value.address)) return;
    upgradedRef.current = true;
    const lat = Number(value.lat);
    const lng = Number(value.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    void reverseGeocode(maps, lat, lng).then(({ address, placeId }) => {
      if (!address) return;
      const input = inputRef.current;
      if (input) input.value = address;
      onChangeRef.current?.({ address, lat, lng, placeId });
    });
  }, [maps, value?.address, value?.lat, value?.lng]);

  const handleLocateMe = useCallback(() => {
    setGeocodeError("");
    if (!maps) return;
    if (!navigator.geolocation) {
      setGeocodeError("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setShowMap(true);
        setLocating(false);
        const { address, placeId, status } = await reverseGeocode(maps, lat, lng);
        if (!address) {
          setGeocodeError(buildGeocodeError(status));
        }
        const input = inputRef.current;
        if (input) input.value = address || "";
        onChangeRef.current?.({
          address: address || "",
          lat,
          lng,
          placeId,
        });
      },
      (err) => {
        setLocating(false);
        setGeocodeError(`Could not get your location (${err.message}).`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [maps]);

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Location</label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="input"
            defaultValue={isBareCoordinates(value?.address) ? "" : value?.address || ""}
            placeholder="Search for an address, city, or place…"
            onChange={(e) => {
              if (geocodeError) setGeocodeError("");
            }}
          />
          <button
            type="button"
            className="btn-secondary shrink-0 px-4 py-2 text-xs"
            onClick={handleLocateMe}
            disabled={locating || !maps}
          >
            {locating ? "Locating…" : "📍 Locate Me"}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {maps
            ? "Search, drag the pin, or use “Locate me”. The address field syncs automatically."
            : "Google Maps is loading…"}
        </p>
      </div>

      {showMap && maps && (
        <div ref={mapDivRef} className="h-64 w-full overflow-hidden rounded-xl border border-slate-200" />
      )}

      {(geocodeError || loadError) && (
        <p className="text-xs text-amber-600">{geocodeError || loadError}</p>
      )}
    </div>
  );
}