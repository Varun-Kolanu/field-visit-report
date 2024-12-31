import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import BackendRedirection from "./pages/BackendRedirection";
import Login from "./pages/Login";
import PageTitle from "./components/PageTitle";
import { UserProvider } from "./context/context";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./layout/Layout";
import AllReports from "./pages/AllReports";
import ReportForm from "./pages/ReportForm";
import MyReports from "./pages/MyReports";
import AdminPanel from "./pages/Admin";

function App() {

  return (
    <>
      <Toaster position="top-center" />
      <Router>
        <Routes>
          <Route
            path="/backend_redirect"
            element={<BackendRedirection />}
          />
          <Route
            path="/login"
            element={
              <>
                <PageTitle title="Login | Field Visit Report" />
                <Login />
              </>
            }
          />
          <Route
            path=""
            element={
              <UserProvider>
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              </UserProvider>
            }
          >
            <Route
              index
              element={
                <>
                  <PageTitle title="Report Form" />
                  <ReportForm />
                </>} />
            <Route
              path="/all_reports"
              element={
                <>
                  <PageTitle title="All Reports" />
                  <AllReports />
                </>} />
            <Route
              path="/my_reports"
              element={
                <>
                  <PageTitle title="My Reports" />
                  <MyReports />
                </>} />
            <Route
              path="/admin"
              element={
                <>
                  <PageTitle title="Admin Panel" />
                  <AdminPanel />
                </>} />
          </Route>
          {/* <Route
            path="/add_report"
            element={<AddReport />}
          /> */}
        </Routes>
      </Router>
    </>
  )
}

export default App
