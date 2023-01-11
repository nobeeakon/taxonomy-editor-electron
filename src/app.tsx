import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import Home from "./front/Home";
import Taxonomy from "./front/Taxonomy";
import SearchText from "./front/search/SearchText";
import NodeInfo from "./front/node/Node";
import ErrorRoute from "./front/ErrorRoute";

const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route
        path=":taxonomy"
        element={<Taxonomy />}
        errorElement={<ErrorRoute />}
      >
        <Route path="search" element={<SearchText />} />
        <Route path=":nodeName" element={<NodeInfo />} />
      </Route>
    </>
  )
);

const App = () => <RouterProvider router={router} />;

function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
}

render();
