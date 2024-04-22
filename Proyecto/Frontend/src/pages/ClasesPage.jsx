import Navbar from "../components/Navbar";
import { Card } from "../components/Card";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { API_URL } from "./url";

export default function ClasesPage() {
  const [clases, setClases] = useState([]);

  useEffect(() => {
    const clases = async () => {
      const response = await fetch(`${API_URL}/clases`);
      const data = await response.json();
      setClases(data);
    };
    clases();
  }, []);

  const handleClick = (key) => {
    Cookies.set("clase", key);
  };

  return (
    <>
      <Navbar />
      <div className="grid grid-cols-3 p-4 gap-4 ">
        <h1 className="text-2xl col-span-3 font-bold text-center">Clases disponibles:</h1>
        {clases.map((clase) => (
          <Card key={clase.ID}>
            <h1 className="text-text200 flex items-center justify-center borde text-2xl font-bold">
              {clase.Nombre}
            </h1>
            <h3>
              <b>Profesor:</b> {clase.Profesor}
            </h3>
            <h3>
              <b>Lugar:</b> {clase.Lugar}
            </h3>
            <h3>
              <b>Horario:</b> {clase.Hora}
            </h3>
            <div className="flex items-center justify-center">
              <button
                className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full text-text100"
                onClick={() => handleClick(clase.ID)}
              >
                <a href="/clase-ind">Informacion</a>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
