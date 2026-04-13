// import styles from './DroneRoute.module.css';
import Map, { Layer, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { IOrderHistory } from "../../../api/models/IOrder";
interface IDroneRouteProps {
  orderHistory: IOrderHistory[];
}

export const DroneRoute = (props: IDroneRouteProps) => {
  const position = props.orderHistory.map((history) => ({
    latitude: history.location.latitude,
    longitude: history.location.longitude,
    timestamp: history.createdAt,
  }));

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

  const lastPosition = position[props.orderHistory.length - 1];
  const dronePoint = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lastPosition.longitude, lastPosition.latitude],
    },
  };

  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_API_KEY}
      initialViewState={{
        longitude: lastPosition.longitude,
        latitude: lastPosition.latitude,
        zoom: 12,
      }}
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
    </Map>
  );
};
