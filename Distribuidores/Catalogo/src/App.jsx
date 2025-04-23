import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Categoria from "./pages/Categoria";
import Produto from "./pages/Produto";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/categoria/:nome" element={<Categoria />} />
      <Route path="/produto/:slug" element={<Produto />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}