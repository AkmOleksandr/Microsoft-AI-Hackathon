import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children, handleLogout, user }) => {
  return (
    <div>
      <Navbar handleLogout={handleLogout} user={user} />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
