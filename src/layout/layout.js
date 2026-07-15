import Sidebar from "./sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#F6F8FC]">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;