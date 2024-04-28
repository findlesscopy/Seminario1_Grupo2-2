import Navbar from "../components/Navbar";
import { Chatbot } from "../components/Chatbot";
import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { API_URL } from "./url";


export default function RutinasPage() {

  const [clases, setClases] = useState([]);
  const [usuario, setUsuario] = useState();
  const [desc, setDesc] = useState();
  const [translatedDesc, setTranslatedDesc] = useState(""); // Agregamos estado para la descripción traducida

  useEffect(() => {
    const fetchClases = async () => {
      const response = await fetch(`${API_URL}/clases/${Cookie.get("clase")}`);
      const data = await response.json();
      setClases(data);
      setDesc(data[0].Descripcion);
    };
    fetchClases();

    const obtenerUsuario = async () => {
      const response = await fetch(`${API_URL}/usuario/${Cookie.get("id")}`);
      const data = await response.json();
      setUsuario(data);
    };
    obtenerUsuario();
    
  }, []);

  const handleTranslate = () => {
    fetch(`${API_URL}/traducir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texto: clases[0].Descripcion,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      setTranslatedDesc(data.traduccion); // Actualizamos la descripción traducida
    });
  }

  const handleRecordar = () => {
    fetch (`${API_URL}/suscribir_email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: clases[0].Nombre,
        email: usuario[0].CorreoElectronico,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });
    
    // esperar a que se suscriba al topic
    fetch(`${API_URL}/publicar_mensaje`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mensaje: `Se ha suscrito a la clase ${clases[0].Nombre}`,
        topicName: clases[0].Nombre,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });

  }

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
              <h1 className="text-xl ">{translatedDesc ? translatedDesc : desc}</h1> {/* Usamos la descripción traducida si está disponible, de lo contrario, usamos la original */}
            </div>
            <button className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full text-text-100" onClick={handleTranslate}>
              Traducir
            </button>
            <button className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full text-text-100" onClick={handleRecordar}>
              Recuerdame
            </button>
          </div>
        ))}
      </div>
      <Chatbot />
    </div>
  );
}


