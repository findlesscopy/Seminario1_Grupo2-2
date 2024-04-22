import Navbar from "../components/Navbar";
import { Chatbot } from "../components/Chatbot";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { API_URL } from "./url";

export default function RutinasPage() {

  const [clases, setClases] = useState([]);

  useEffect(() => {
    const clases = async () => {
      const response = await fetch(`${API_URL}/clases/${Cookie.get("clase")}`);
      const data = await response.json();
      setClases(data);
    };
    clases();
  }, []);

  return (
    <div>
      <Navbar />
      <div className=" flex flex-col p-4 m-4 bg-bg200">
      {clases.map((clase) => (
          <div key={clase.ID}>
            <h1 className="text-2xl font-bold text-center">Ejercicio: {clase.Nombre}</h1>
            <br />
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Tipo:</label>
              <h1 className="text-xl ">{clase.Tipo}</h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Profesor:</label>
              <h1 className="text-xl ">{clase.Profesor}</h1>
            </div>
            <div className="flex">
              <label className="text-xl font-bold mr-2">Hora:</label>
              <h1 className="text-xl">{clase.Hora}</h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Fecha:</label>
              <h1 className="text-xl ">{clase.Fecha}</h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Lugar:</label>
              <h1 className="text-xl ">{clase.Lugar}</h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Cupo:</label>
              <h1 className="text-xl ">{clase.Cupo}</h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Descripción:</label>
              <h1 className="text-xl ">{clase.Descripcion}</h1>
            </div>
            <button className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full text-text-100">
              Traducir
            </button>
            <button className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full text-text-100">
              <a href="/clases">Lectura en voz alta</a>
            </button>
            <button className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full text-text-100">
              <a href="/clases">Recuerdame</a>
            </button>
          </div>
        ))}
      </div>
      <Chatbot />
    </div>
  );
}
