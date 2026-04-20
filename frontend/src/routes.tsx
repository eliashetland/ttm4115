import { createBrowserRouter } from "react-router-dom";
import { Example } from "./example/Example";
import { Drone } from "./drone/Drone";
import { AllDrones } from "./drone/AllDrones";
import { CreateOrder } from "./order/CreateOrder";
import { OneOrder } from "./order/oneOrder/OneOrder";
import { Operator } from "./operator/Operator";
import { Home } from "./home/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
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
    path: "/operator",
    element: <Operator />,
  },
  {
    path: "/example",
    element: <Example />,
  },
]);
