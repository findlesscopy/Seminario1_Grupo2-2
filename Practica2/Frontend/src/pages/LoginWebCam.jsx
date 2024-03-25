import React, { useRef, useState } from "react";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { API_URL } from "./url";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const usernameRef = useRef(null); // Referencia para el campo de entrada de usuario
  const [base64Image, setBase64Image] = useState(null);
  const navigate = useNavigate();

  const startCamera = async () => {
    const constraints = { video: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  const takePhoto = async () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const base64String = canvasRef.current.toDataURL("image/png").split(",")[1];
    setBase64Image(base64String);
      // apagar la camara
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      track.stop();
    }
    );
    // Obtener el valor del campo de entrada de usuario
    const username = usernameRef.current.value;
    console.log("Username:", username);
    console.log("Base64:", base64String);
    const response = await fetch(`${API_URL}/reconocimiento_facial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imagen: base64String,
        username: username,
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      if (responseData.EsLaMismaPersona) {
        Cookies.set("id", responseData.id_usuario);
        Cookies.set("username", username);
        navigate("/principal");
      }else{
        alert("No se reconoció la cara");
      }
    }
  };

  return (
    <div className="App">
      <center>
        <div className="video-container">
          <video className="video" ref={videoRef} width="400" height="400" />
          <canvas className="canvas" ref={canvasRef} width="400" height="400" />
        </div>
        <br></br>
        <Card>
          <h1 className="text-2xl font-bold">Login</h1>

          <Label htmlFor="username">Username:</Label>
          <Input
            type="text"
            name="username"
            placeholder="Username"
            ref={usernameRef}
          />
          <Link className="text-xs block my-1 text-slate-300" to="/register">
            ¿No tienes cuenta? Registrate
          </Link>
          <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 mx-2" onClick={startCamera}>
            Iniciar cámara
          </button>
          <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 mx-2" onClick={takePhoto}>
            Log in
          </button>
        </Card>
      </center>
    </div>
  );
}

export default App;
