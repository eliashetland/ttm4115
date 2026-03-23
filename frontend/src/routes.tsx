import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Example } from "./example/Example";
import { DronePosition } from "./dronePosition/DronePostion";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/drone-position/:droneId",
    element: <DronePosition />,
  },
  {
    path: "/example",
    element: <Example />,
  }
]);
