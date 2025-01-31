import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./components/Body/mainpage/BodyManager";
import Signup from "./components/Sign/Signup";
import Signin from "./components/Sign/Signin";
import HeadManager from "./components/Head/HeadManager";
import ProtectedRoutes from "./components/ProtectedRoutes";
import ProfileDetails from "./components/Body/profile-details/ProfileDetails";
import VerifiedAuth from "./components/Body/SellProducts/VerifiedAuth";
import SellProducts from "./components/Body/SellProducts/SellProducts";
import ProductPage from "./components/Body/product-page/ProductPage";
import ProductQuery from "./components/Body/ProductsQueryPage/ProductQuery";
import SearchProducts from "./components/Body/search_products/SearchProducts";
import OrderPage from "./components/Body/order-page/OrderPage";

function App() {
  return (
    <div className="App">
      <Router>
        <HeadManager />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/item-page/:id" element={<ProductPage />} />
          <Route path="/category-page/:category" element={<ProductQuery />} />
          <Route path="/search-products" element={<SearchProducts />} />
          <Route path="/order" element={<OrderPage />} />
          <Route element={<ProtectedRoutes />}>
            {/* Verified only routes: */}
            <Route element={<VerifiedAuth />}>
              <Route path="/sell-products" element={<SellProducts />} />
            </Route>
            {/* Protected Routes Here */}
            <Route path="/profile-details" element={<ProfileDetails />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
