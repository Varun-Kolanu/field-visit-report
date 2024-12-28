import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddReport from './pages/AddReport';

function App() {

  return (

    <Router>
      <Routes>
        <Route
          path="/add_report"
          element={<AddReport />}
        />
      </Routes>
    </Router>
  )
}

export default App
