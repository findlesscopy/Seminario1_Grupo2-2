import React, { useRef, useState } from "react";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/Input";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const usernameRef = useRef(null); // Referencia para el campo de entrada de usuario
  const [base64Image, setBase64Image] = useState(null);

  const startCamera = async () => {
    const constraints = { video: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  const takePhoto = () => {
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

    // Obtener el valor del campo de entrada de usuario
    const username = usernameRef.current.value;
    console.log("Username:", username);
    fetch("http://localhost:3000/reconocimiento_facial", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": `${base64Image.split(",")[1].length}`,
      },
      body: JSON.stringify({
        image: base64Image,
        username: username, 
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {});
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
          <Input type="text" name="username" placeholder="Username" ref={usernameRef} />
          <Link className="text-xs block my-1 text-slate-300" to="/register">
            ¿No tienes cuenta? Registrate
          </Link>
          <button className="camara-btn" onClick={startCamera}>
            Iniciar cámara
          </button>
          <button className="foto-btn" onClick={takePhoto}>
            Log in
          </button>
        </Card>
      </center>
    </div>
  );
}

export default App;