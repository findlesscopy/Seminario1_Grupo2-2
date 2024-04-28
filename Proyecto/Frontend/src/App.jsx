import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PrincipalPage from "./pages/PrincipalPage";
import ClasesPage from "./pages/ClasesPage";
import ClasePage from "./pages/Clase-ind";
import RutinasPage from "./pages/RutinasPage";
import RutinasAdm from "./pages/AsignarNivelPage";
import PerfilPage from "./pages/PerfilPage";
import VerSolicitudesPage from "./pages/VerSolicitudesPage";
import EjercicioPage from "./pages/EjercicioPage";
import LoginWebCam from "./pages/LoginWebCam";
import FitzyPage from "./pages/FitzyPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/principal" element={<PrincipalPage/>} />
        <Route path="/clases" element={<ClasesPage/>} />
        <Route path="/clase-ind" element={<ClasePage/>} />
        <Route path="/rutinas" element={<RutinasPage/>} />
        <Route path="/asignacion" element={<RutinasAdm/>} />
        <Route path="/perfil" element={<PerfilPage/>} />
        <Route path="/solicitudes" element={<VerSolicitudesPage/>} />
        <Route path="/ejercicio" element={<EjercicioPage/>} />
        <Route path="/webcam" element={<LoginWebCam/>} />
        <Route path="/fitzy" element={<FitzyPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
