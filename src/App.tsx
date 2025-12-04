import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Search from "./pages/Search";
import AddListing from "./pages/AddListing";
import PropertyDetailsPage from "./pages/PropertyDetails";
import ListingSuccess from "./pages/ListingSuccess";
import SellerDashboard from "./pages/seller/SellerDashboard";
import AddProperty from "./pages/seller/AddProperty";
import MyProperties from "./pages/seller/MyProperties";
import OffersReceived from "./pages/seller/OffersReceived";
import ProfileSettings from "./pages/seller/ProfileSettings";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  const location = useLocation();

  // Pages where header & footer SHOULD NOT show
  const authPages = ["/signin", "/signup"];
  const dashboardPages = location.pathname.startsWith("/seller") || 
                         location.pathname.startsWith("/buyer") ||
                         location.pathname.startsWith("/agent") ||
                         location.pathname.startsWith("/admin");
  const hideLayout = authPages.includes(location.pathname) || dashboardPages;

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
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Unauthorized</h1>
                  <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            }
          />
          
          {/* Protected Seller Routes with userId */}
          <Route
            path="/seller/:userId/dashboard"
            element={
              <ProtectedRoute requiredRole="seller">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/:userId/properties"
            element={
              <ProtectedRoute requiredRole="seller">
                <MyProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/:userId/add"
            element={
              <ProtectedRoute requiredRole="seller">
                <AddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/:userId/offers"
            element={
              <ProtectedRoute requiredRole="seller">
                <OffersReceived />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/:userId/settings"
            element={
              <ProtectedRoute requiredRole="seller">
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/dashboard/:userId"
            element={
              <ProtectedRoute requiredRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/dashboard/:userId"
            element={
              <ProtectedRoute requiredRole="agent">
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:userId"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
