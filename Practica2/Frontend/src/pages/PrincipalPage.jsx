import { NavBarSimple } from "../components/NavBar";
import { Footer } from "../components/Footer";
import Cookies from "js-cookie";
import { API_URL } from "./url";
import { useEffect, useState } from "react";

function PrincipalPage() {
  const username = Cookies.get("username");
  const id_usuario = Cookies.get("id");

  const [usuarioActivo, setUsuarioActivo] = useState({
    username: username,
    id_usuario: id_usuario,
    nombre: "",
    url_foto: "",
  });

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
        console.log("Datos del usuario:", data);
        setUsuarioActivo((prevState) => ({
          ...prevState,
          nombre: data.nombre,
          url_foto: data.url_foto,
        }));
      })
      .catch((error) =>
        console.error("Error al obtener datos del usuario:", error)
      );
  }, [username]);
  console.log("Usuario activo:", usuarioActivo);

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
                <h1 className="text-xl ">{usuarioActivo.nombre}</h1>
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
      </div>
    </>
  );
}

export default PrincipalPage;
