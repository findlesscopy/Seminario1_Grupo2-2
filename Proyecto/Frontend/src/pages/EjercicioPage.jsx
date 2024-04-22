import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { API_URL } from "./url";

export default function EjercicioPage() {
  const [ejercicios, setEjercicios] = useState([]);

  useEffect(() => {
    const ejercicios = async () => {
      const response = await fetch(
        `${API_URL}/ejercicio/${Cookie.get("ejercicio")}}`
      );
      const data = await response.json();
      setEjercicios(data);
    };
    ejercicios();
  }, []);

  return (
    <>
      <Navbar />
      <div className=" flex flex-col p-4 m-4 bg-bg200">
        {ejercicios.map((ejercicio) => (
          <div key={ejercicio.ID}>
            <h1 className="text-2xl font-bold text-center">
              Ejercicio: {ejercicio.Nombre}
            </h1>
            <br />
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Tipo:</label>
              <h1 className="text-xl ">{ejercicio.Tipo}</h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Repeticiones:</label>
              <h1 className="text-xl ">{ejercicio.Repeticiones}</h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Series:</label>
              <h1 className="text-xl ">{ejercicio.Series}</h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Descripción:</label>
              <h1 className="text-xl ">{ejercicio.Descripcion}</h1>
            </div>
            <label className="text-xl font-bold mr-2">Foto de referencia:</label>
            <div className="flex justify-center items-center">
              <img src="https://www.shutterstock.com/image-vector/exercise-guide-by-woman-doing-260nw-1303854643.jpg" alt="" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
