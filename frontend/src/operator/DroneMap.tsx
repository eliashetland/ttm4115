import Map, { Layer, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { IDronePosition } from "../api/models/IDronePosition";
import { TRONDHEIM_COORDINATES } from "../constants";
import { useEffect, useState } from "react";
interface IDroneRouteProps {
  position: IDronePosition[];
}

export const DroneMap = (props: IDroneRouteProps) => {
  const [viewState, setViewState] = useState({
    longitude: TRONDHEIM_COORDINATES.longitude,
    latitude: TRONDHEIM_COORDINATES.latitude,
    zoom: 12,
  });

  useEffect(() => {
    if (props.position.length === 1) {
      setViewState({
        longitude: props.position[0].longitude,
        latitude: props.position[0].latitude,
        zoom: 14,
      });
    }
  }, [props.position]);

  const dronePoints = {
    type: "FeatureCollection",
    features: props.position.map((p) => ({
      type: "Feature",
      properties: {
        id: String(p.droneId),
      },
      geometry: {
        type: "Point",
        coordinates: [p.longitude, p.latitude],
      },
    })),
  };

  if (props.position.length === 0) return <div>Loading...</div>;

  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_API_KEY}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: 400 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      <Source id="drone" type="geojson" data={dronePoints as any}>
        <Layer
          id="drone-layer"
          type="circle"
          paint={{
            "circle-radius": 10,
            "circle-color": "#0000ff",
          }}
        />

        <Layer
          id="drone-labels"
          type="symbol"
          layout={{
            "text-field": ["get", "id"],
            "text-size": 14,
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-anchor": "center",
          }}
          paint={{
            "text-color": "#ffffff",
          }}
        />
      </Source>
    </Map>
  );
};
