import React from "react";
import CatagoriesBar from "./CategoriesBar";
import Navbar from "./Navbar";

export default function HeadManager() {
  return (
    <div>
      <div id="navbar-menu">{<Navbar />}</div>
      <div id="category-menu">{<CatagoriesBar />}</div>
    </div>
  );
}
