import { Card } from "../components/Card";
import Navbar from "../components/NavbarAdmin";
import { Label } from "../components/Label";
import { API_URL } from "./url";
import { useState, useEffect } from "react";
import { ErrorModal } from "../components/ErrorModal";
import { NotificationModal } from "../components/NotificacionModal";
import { set } from "react-hook-form";

export default function RutinasAdm() {
  const [nombres, setNombres] = useState([]);
  const [nivel, setNivel] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const usuarios = async () => {
      const response = await fetch(`${API_URL}/usuarios/all`);
      const data = await response.json();
      setNombres(data);
    };
    usuarios();

    const niveles = async () => {
      const response = await fetch(`${API_URL}/niveles`);
      const data = await response.json();
      setNivel(data);
    };

    niveles();
  }, []);

  const handleAsignarNivel = async () => {
    const id_usuario = document.getElementById("nombre").value;
    const nivel = document.getElementById("nivel").value;

    if (id_usuario === "0" || nivel === "0") {
      alert("Selecciona un nombre y un nivel");
      return;
    }

    const response = await fetch(`${API_URL}/asignarNivel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idUsuario: id_usuario,
        nivel: nivel,
      }),
    });
    if (!response.ok) {
      setError("Error al asignar el nivel");
      throw new Error("Error al rechazar la solicitud");
    } else {
      setNotification("Nivel asignado correctamente");
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-screen flex flex-col justify-center items-center -mt-16 ">
        <Card>
          <h1 className="text-2xl font-bold text-center">Asignar un nivel:</h1>
          <br />
          <form>
            <Label htmlFor="nombre">Nombre:</Label>
            <select
              id="nombre"
              name="nombre"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="0">Selecciona un nombre</option>
              {nombres.map((nombre) => (
                <option key={nombre.ID} value={nombre.ID}>
                  {nombre.Nombre + " " + nombre.Apellido}
                </option>
              ))}
            </select>
            <Label htmlFor="nivel">Nivel:</Label>
            <select
              id="nivel"
              name="nivel"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="0">Selecciona un nivel</option>
              {nivel.map((nivel) => (
                <option key={nivel.ID} value={nivel.ID}>
                  {nivel.Nombre}
                </option>
              ))}
            </select>
            <br />
          </form>
          <button
            className="bg-primary100 px-4 py-1 hover:bg-primary200 rounded-md my-1 w-full text-text100 font-semibold "
            onClick={handleAsignarNivel}
          >
            Asignar nivel
          </button>
        </Card>
      </div>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      {notification && (
        <NotificationModal
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}
