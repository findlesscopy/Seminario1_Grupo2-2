import { NavBarSimple } from "../components/NavBar";
import Cookies from "js-cookie";
import { API_URL } from "./url";
import { useEffect, useState } from "react";
import { Chatbot } from "../components/ui/ChatBot";

function PrincipalPage() {
  const username = Cookies.get("username");
  const id_usuario = Cookies.get("id");

  const [usuarioActivo, setUsuarioActivo] = useState({
    username: username,
    id_usuario: id_usuario,
    nombre: "",
    url_foto: "",
  });
  
  const [descripcion, setDescripcion] = useState({texto: ""});


  useEffect(() => {
    // Realizar la solicitud GET al servidor para obtener los datos del usuario
    fetch(`${API_URL}/obtener_usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        id_usuario: parseInt(id_usuario),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log("Datos del usuario:", data);
        setUsuarioActivo((prevState) => ({
          ...prevState,
          nombre: data.nombre,
          url_foto: data.url_foto,
        }));
      })
      .catch((error) =>
        console.error("Error al obtener datos del usuario:", error)
      );


      fetch(`${API_URL}/descripcion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: parseInt(id_usuario)
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          let desc = "";
          if(data.genero == "Male") desc += "El usuario "
          else desc += "La usuaria "
          desc += "tiene un rango de edad entre " + data.minimo + " y " + data.maximo + ". Se encuentra " + data.emocion + " y " + data.emocion1 + ".";
          if (data.lentes == true) desc += " Usa lentes."
          if (data.barba == true) desc += " Tiene barba."
          if (data.bigote == true) desc += " Tiene bigote."
          setDescripcion((prevState) => ({
            ...prevState,
            texto: desc
          }));
        })
        .catch((error) =>
  
          console.error("Error al obtener descripcion:", error)
        );
  }, [username]);

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
                <label className="text-xl font-bold mr-2">Username:</label>
                <h1 className="text-xl">{username}</h1>
              </div>
            </div>
            <div className="col-span-3 flex flex-col justify-center items-center bg-zinc-900">
              <div className="flex flex-row justify-center items-center ">
                <label className="text-xl font-bold mr-2">Nombre completo:</label>
                <h1 className="text-xl ">{usuarioActivo.nombre}</h1>
              </div>
            </div>
            <div className="col-span-3 flex flex-col justify-center items-center bg-zinc-900">
              <div className="flex flex-row justify-center items-center ">
                <label className="text-xl font-bold mr-2">Tags:</label>
                <h1 className="text-xl ">{descripcion.texto}</h1>
              </div>
            </div>
            <div className="col-span-3 flex flex-col justify-center items-center bg-zinc-900">
              <img
                src={usuarioActivo.url_foto}
                alt="Imagen"
                className="h-80 w-80 rounded-full"
              />
            </div>
          </div>
        </div>
        <Chatbot/>
      </div>
    </>
  );
}

export default PrincipalPage;
