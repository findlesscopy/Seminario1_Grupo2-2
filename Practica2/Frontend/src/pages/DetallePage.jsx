import { NavBarSimple } from "../components/NavBar";
import { API_URL } from "./url";
import React, { useState } from "react";
import Cookies from 'js-cookie'

function DetallePage() {
  const [idioma, setIdioma] = useState("");
  const foto_nombre = Cookies.get('foto_actual_nombre')
  const foto_descripcion = Cookies.get('foto_actual_descripcion')
  const foto_url = Cookies.get('foto_actual_url')
  const  [traduccion, setTraduccion] = useState("")

  const handleSelectChange = (event) => {
    setIdioma(event.target.value); // Actualiza el estado con el valor seleccionado
  };
  
  const traducir_desc = async() =>{
    console.log(idioma)
    const responseTraduccion = await fetch(
      `${API_URL}/traducir`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: foto_descripcion, idioma: idioma}),
      }
    );
    
    const traduccion = await responseTraduccion.json()
    console.log(traduccion)
    setTraduccion(traduccion.traduccion)

  }

  return (
    <>
      <div>
        <NavBarSimple />
        <div className="grid grid-cols-5 p-4">
          <div className="col-span-5 grid grid-cols-3 gap-4 bg-zinc-800">
            <h1 className="text-xl font-bold col-span-3 bg-zinc-900">
              Datos Personales:
            </h1>
            <div className="col-span-3 flex flex-col justify-center items-center bg-zinc-900">
              <div className="flex flex-row justify-center items-center ">
                <label className="text-xl font-bold mr-2">Nombre:</label>
                <h1 className="text-xl">{foto_nombre}</h1>
              </div>
            </div>
            <div className="col-span-3 flex flex-col justify-center items-center bg-zinc-900">
              <div className="flex flex-row justify-center items-center ">
                <label className="text-xl font-bold mr-2">Descripcion:</label>
                <h1 className="text-xl ">{foto_descripcion}</h1>
              </div>
            </div>
            <div className="col-span-3 flex flex-col justify-center items-center bg-zinc-900">
              <img
                src={foto_url}
                alt="Imagen"
                className="h-80 w-80 rounded-full"
              />
            </div>
            <div className="col-span-3 flex flex-col justify-center items-center bg-zinc-900">
              <label className="text-xl font-bold mr-2">Traducir descripción:</label>
              <select className="bg-zinc-500" value={idioma} onChange={handleSelectChange}>
                <option defaultChecked value="">Selecciona un idioma</option>
                <option value="en">Inglés</option>
                <option value="it">Italiano</option>
                <option value="fr">Francés</option>
              </select>
              <textarea className="col-span-3 bg-zinc-800" rows="8" cols="50" defaultValue={traduccion}></textarea>
              <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300" onClick={traducir_desc}>Traducir</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DetallePage;
