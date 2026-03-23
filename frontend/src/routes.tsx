import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Example } from "./example/Example";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/example",
    element: <Example />,
  }
]);
