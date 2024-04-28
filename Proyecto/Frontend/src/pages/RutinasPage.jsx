import Navbar from "../components/Navbar";
import { Card } from "../components/Card";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { API_URL } from "./url";
import { set } from "react-hook-form";

export default function Rutinas() {
  const [rutinas, setRutinas] = useState([]);
  const [nivel, setNivel] = useState("");

  useEffect(() => {
    const rutinas = async () => {
      const response = await fetch(
        `${API_URL}/rutinas_ejercicios/${Cookies.get("id")}` // Aquí debes acceder al id del usuario
      );
      const data = await response.json();
      setRutinas(data);
    };
    rutinas();

    const nivel = async () => {
      const response = await fetch(`${API_URL}/usuario/${Cookies.get("id")}`); 
      const data = await response.json();
      setNivel(data[0].Nivel);
    };

    nivel();
  }, []);

  const handleClick = (key) => {
    Cookies.set("ejercicio", key);
  };




  return (
    <>
      <Navbar />
      <div className="grid grid-cols-3 p-4 gap-4 ">
        <h1 className="text-2xl col-span-3 font-bold text-center">Nivel {nivel}:</h1>
        {rutinas.map((rutina) => (
          <Card key={rutina.ID}>
            <h1 className="text-text200 flex items-center justify-center borde text-2xl font-bold">
              {rutina.Nombre}
            </h1>
            <h3>
              <b>Descripcion:</b> {rutina.Descripcion}
            </h3>
            <div className="flex flex-col">
              {rutina.ejercicios.map((ejercicio, index) => (
                <button
                  key={index}
                  className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full text-text-100"
                  onClick={() => handleClick(ejercicio.ID)} // Aquí debes acceder al nombre del ejercicio
                >
                  <a href="/ejercicio">{ejercicio.Nombre}</a>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}