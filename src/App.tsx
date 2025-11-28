import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Search from "./pages/Search";
import AddListing from "./pages/AddListing";
import PropertyDetailsPage from "./pages/PropertyDetails";
import ListingSuccess from "./pages/ListingSuccess";
import SellerDashboard from "./pages/seller/SellerDashboard";

function App() {
  const location = useLocation();

  // Pages where header & footer SHOULD NOT show
  const authPages = ["/signin", "/signup"];
  const sellerPages = location.pathname.startsWith("/seller");
  const hideLayout = authPages.includes(location.pathname) || sellerPages;

  return (
    <div className="bg-blue-50 min-h-screen flex flex-col">

      {/* Header only on NON-auth pages */}
      {!hideLayout && <Header />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/search" element={<Search />} />
          <Route path="/add" element={<AddListing />} />
          <Route path="/property/:id" element={<PropertyDetailsPage />} />
          <Route path="/listing-success" element={<ListingSuccess />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
