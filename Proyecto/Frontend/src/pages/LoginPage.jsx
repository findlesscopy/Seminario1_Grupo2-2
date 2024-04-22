import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Card } from "../components/Card";
import { Link } from "react-router-dom";
import { API_URL } from "./url";
import { useNavigate } from "react-router-dom";
import { ErrorModal } from "../components/ErrorModal";
import Cookies from "js-cookie";

function LoginPage() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_URL}/credenciales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          contraseña: data.password,
        }),
      });

      if (!response.ok) {
        // Manejar error
      } else {
        const responseData = await response.json();
        console.log(responseData);
        Cookies.set("id", responseData.id_usuario);
        Cookies.set("username", data.username);
        navigate("/principal");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al iniciar sesión " + error);
    }
  };

  function onClick() {
    navigate("/webcam");
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <Card>
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <br></br>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Label htmlFor="username">Username:</Label>
          <Input
            type="text"
            name="username"
            {...register("username", { required: true })}
            placeholder="Username"
          />

          <Label htmlFor="password">Contraseña:</Label>
          <Input
            type="password"
            name="password"
            placeholder="Escribe tu contraseña"
            {...register("password", { required: true, minLength: 6 })}
          />

          <Link className="text-xs block my-1 text-text200" to="/register">
            ¿No tienes cuenta? Registrate
          </Link>
          <br></br>
          <div className="flex items-center justify-center">
          
            <button className="bg-primary100 px-4 py-1 hover:bg-primary200 rounded-md my-1 w-full text-text100 font-semibold ">
              Login
            </button>
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-primary100 px-4 py-1 hover:bg-primary200 rounded-md my-1 w-full text-text100 font-semibold "
              onClick={onClick}
            >
              Login Reconocimiento Facial
            </button>
          </div>
        </form>
      </Card>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </div>
  );
}

export default LoginPage;
