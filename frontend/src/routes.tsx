import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Example } from "./example/Example";
import { Drone } from "./drone/Drone";
import { AllDrones } from "./drone/AllDrones";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/drone/",
    element: <AllDrones />,
  },
  {
    path: "/drone/:droneId",
    element: <Drone />,
  },
  {
    path: "/example",
    element: <Example />,
  }
]);
