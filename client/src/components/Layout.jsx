import Navbar from "./Navbar";

const Layout = ({ children, handleLogout, user }) => {
  return (
    <div>
      <Navbar handleLogout={handleLogout} user={user} />
      {children}
    </div>
  );
};

export default Layout;
