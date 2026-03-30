import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Example } from "./example/Example";
import { Drone } from "./drone/Drone";
import { AllDrones } from "./drone/AllDrones";
import { CreateOrder } from "./order/CreateOrder";
import { OneOrder } from "./order/oneOrder/OneOrder";

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
    path: "/orders",
    element: <CreateOrder />,
  },
  {
    path: "/orders/:orderId",
    element: <OneOrder />,
  },
  {
    path: "/example",
    element: <Example />,
  },
]);
