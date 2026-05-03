// import styles from './DroneRoute.module.css';
import Map, { Layer, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { IOrderHistory, IOrderLocation } from "../../../api/models/IOrder";
import { useEffect, useState } from "react";

interface IDroneRouteProps {
  orderHistory: IOrderHistory[];
  target: IOrderLocation;
}

export const DroneRoute = (props: IDroneRouteProps) => {
  const position = props.orderHistory.map((history) => ({
    latitude: history.location.latitude,
    longitude: history.location.longitude,
    timestamp: history.createdAt,
  }));

  const lastPosition = position[props.orderHistory.length - 1];

  const [viewState, setViewState] = useState({
    longitude: lastPosition?.longitude ?? props.target.longitude,
    latitude: lastPosition?.latitude ?? props.target.latitude,
    zoom: 12,
  });

  useEffect(() => {
    if (lastPosition) {
      setViewState((v) => ({
        ...v,
        longitude: lastPosition.longitude,
        latitude: lastPosition.latitude,
      }));
    }
  }, [lastPosition?.latitude, lastPosition?.longitude]);

  if (!lastPosition) return <div>No location data</div>;

  const lineGeoJSON = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: position.map((p) => [p.longitude, p.latitude]),
    },
  };

  const pointsGeoJSON = {
    type: "FeatureCollection",
    features: position.map((p) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [p.longitude, p.latitude],
      },
    })),
  };

  const dronePoint = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lastPosition.longitude, lastPosition.latitude],
    },
  };

  const targetPoint = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [props.target.longitude, props.target.latitude],
    },
  };

  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_API_KEY}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: 400 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      <Source id="route" type="geojson" data={lineGeoJSON as any}>
        <Layer
          id="route-line"
          type="line"
          paint={{
            "line-color": "#ff0000",
            "line-width": 3,
          }}
        />
      </Source>

      <Source id="points" type="geojson" data={pointsGeoJSON as any}>
        <Layer
          id="points-layer"
          type="circle"
          paint={{
            "circle-radius": 5,
            "circle-color": "#0000ff",
          }}
        />
      </Source>

      <Source id="drone" type="geojson" data={dronePoint as any}>
        <Layer
          id="drone-layer"
          type="circle"
          paint={{
            "circle-radius": 10,
            "circle-color": "#0000ff",
          }}
        />
      </Source>

      <Source id="target" type="geojson" data={targetPoint as any}>
        <Layer
          id="target-layer"
          type="circle"
          paint={{
            "circle-radius": 10,
            "circle-color": "#00ff00",
          }}
        />
      </Source>
    </Map>
  );
};
