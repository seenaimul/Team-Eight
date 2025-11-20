import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

function App() {
  const location = useLocation();

  // Pages where header & footer SHOULD NOT show
  const authPages = ["/signin", "/signup"];
  const hideLayout = authPages.includes(location.pathname);

  return (
    <div className="full-background min-h-screen flex flex-col">

      {/* Header only on NON-auth pages */}
      {!hideLayout && <Header />}

      {/* Main Page Content */}
      <div className="flex-grow relative overflow-y-auto max-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>

      {/* Footer only on NON-auth pages */}
      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
