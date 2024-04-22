import Navbar from "../components/Navbar";
import { Card } from "../components/Card";
import Cookies from "js-cookie";
import { API_URL } from "./url";
import { useEffect, useState } from "react";
//import { Chatbot } from "../components/ui/ChatBot";

function PrincipalPage() {
  const username = Cookies.get("username");
  const id_usuario = Cookies.get("id");

  const [usuarioActivo, setUsuarioActivo] = useState({
    username: username,
    id_usuario: id_usuario,
    nombre: "",
    url_foto: "",
  });

  const [descripcion, setDescripcion] = useState({ texto: "" });

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
        id_usuario: parseInt(id_usuario),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        let desc = "";
        if (data.genero == "Male") desc += "El usuario ";
        else desc += "La usuaria ";
        desc +=
          "tiene un rango de edad entre " +
          data.minimo +
          " y " +
          data.maximo +
          ". Se encuentra " +
          data.emocion +
          " y " +
          data.emocion1 +
          ".";
        if (data.lentes == true) desc += " Usa lentes.";
        if (data.barba == true) desc += " Tiene barba.";
        if (data.bigote == true) desc += " Tiene bigote.";
        setDescripcion((prevState) => ({
          ...prevState,
          texto: desc,
        }));
      })
      .catch((error) => console.error("Error al obtener descripcion:", error));
  }, [username]);

  return (
    <>
      <Navbar />
      <div className="h-screen flex flex-col justify-center items-center -mt-10 ">
        <Card>
          <h1 className="text-2xl font-bold text-center">Datos Personales:</h1>
          <br />
          <div className="flex ">
            <label className="text-xl font-bold mr-2">Nombre:{}</label>
            <h1 className="text-xl">Hola</h1>
          </div>
          <div className="flex ">
            <label className="text-xl font-bold mr-2">Altura (cm):</label>
            <h1 className="text-xl ">185</h1>
          </div>
          <div className="flex ">
            <label className="text-xl font-bold mr-2">Peso (lb):</label>
            <h1 className="text-xl ">{descripcion.texto}200</h1>
          </div>
          <div className="flex ">
            <label className="text-xl font-bold mr-2">IMC:</label>
            <h1 className="text-xl ">{descripcion.texto}200</h1>
          </div>
          <div className="col-span-3 flex flex-col justify-center items-center">
            <img
              src="https://guatemalavisible.net/wp-content/uploads/2023/06/Bernardo_Arevalo_SEMILLA.jpg"
              alt="Imagen"
              className="h-60 w-60 rounded-full"
            />
          </div>
        </Card>
      </div>
    </>
  );
}

export default PrincipalPage;
