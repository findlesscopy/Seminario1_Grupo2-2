import {BrowserRouter, Routes, Route} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MainPage from './pages/MainPage'
import PrincipalPage from './pages/PrincipalPage'
import EditPage from './pages/EditPage'
import UploadPage from './pages/UploadPage'
import AlbumPage from './pages/AlbumPage'
import VerPage from './pages/VerPage'
import LoginWebCam from './pages/LoginWebCam'
import ExtraerPage from './pages/ExtraerPage'
import DetallePage from './pages/DetallePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/webcam" element={<LoginWebCam/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/principal" element={<PrincipalPage/>} />
        <Route path="/editar" element={<EditPage/>} />
        <Route path="/ver" element={<VerPage/>} />
        <Route path="/subir" element={<UploadPage/>} />
        <Route path="/album" element={<AlbumPage/>} />
        <Route path="/extraer" element={<ExtraerPage/>} />
        <Route path="/detalle" element={<DetallePage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
