import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./page/home";
import ProductDetail from "./page/productDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:productId" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;