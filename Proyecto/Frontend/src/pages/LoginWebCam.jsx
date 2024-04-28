import React, { useRef, useState } from "react";
import { Label } from "../components/Label";
import { Card } from "../components/Card";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { API_URL } from "./url";
import Cookies from "js-cookie";
import { ErrorModal } from "../components/ErrorModal";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const correoRef = useRef(null); // Referencia para el campo de entrada de usuario
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      const constraints = { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error("Error al iniciar la cámara:", error);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
  };

  const takePhoto = async () => {
    try {
      const context = canvasRef.current.getContext("2d");
      
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
        
      );
      const base64String = canvasRef.current.toDataURL("image/png").split(",")[1];

      // Obtener el valor del campo de entrada de usuario
      const correo = correoRef.current.value;

      const response = await fetch(`${API_URL}/reconocimiento_facial`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imagen: base64String,
          correo: correo,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        if (responseData.EsLaMismaPersona) {
          Cookies.set("id", responseData.id_usuario);
          navigate("/principal");
        } else {
          setError("No se ha podido reconocer la cara");
        }
      } else {
        setError("No se ha podido reconocer la cara");
      }

      // Detener la cámara
      stopCamera();
    } catch (error) {
      console.error("Error al tomar la foto:", error);
      setError("Error al tomar la foto");
    }
  };

  return (
    <div className="App">
      <center>
        <div className="video-container">
          <video className="video" ref={videoRef} width="400" height="400" />
          <canvas className="canvas" ref={canvasRef} width="400" height="400" />
        </div>
        <br />
        <Card>
          <h1 className="text-2xl font-bold">Login</h1>

          <Label htmlFor="correo">Correo:</Label>
          <Input
            type="text"
            name="correo"
            placeholder="Correo"
            ref={correoRef}
          />
          <Link className="text-xs block my-1 text-slate-300" to="/register">
            ¿No tienes cuenta? Registrate
          </Link>
          <Link className="text-xs block my-1 text-slate-300" to="/login">
            Login normal
          </Link>
          <button className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 mx-2" onClick={startCamera}>
            Iniciar cámara
          </button>
          <button className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 mx-2" onClick={takePhoto}>
            Log in
          </button>
        </Card>
        {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      </center>
    </div>
  );
}

export default App;
