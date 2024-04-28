import Navbar from "../components/Navbar";
import { Card } from "../components/Card";
import Cookies from "js-cookie";
import { API_URL } from "./url";
import { useEffect, useState } from "react";
//import { Chatbot } from "../components/ui/ChatBot";

function PrincipalPage() {
  const id_usuario = Cookies.get("id");

  const [usuario, setUsuario] = useState([]);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const response = await fetch(`${API_URL}/usuario/${id_usuario}`);
      const data = await response.json();
      setUsuario(data);
    };
    obtenerUsuario();
  }, []);

  return (
    <>
      <Navbar />
      <div className="h-screen flex flex-col justify-center items-center -mt-10 ">
        {usuario.map((usuario) => (
          <Card key={usuario.ID}>
            <h1 className="text-2xl font-bold text-center">
              Datos Personales:
            </h1>
            <br />

            <div className="flex ">
              <label className="text-xl font-bold mr-2">Nombre:</label>
              <h1 className="text-xl">
                {usuario.Nombre + " " + usuario.Apellido}
              </h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Altura (cm):</label>
              <h1 className="text-xl ">{usuario.Altura}</h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">Peso (lb):</label>
              <h1 className="text-xl ">{usuario.Peso}</h1>
            </div>
            <div className="flex ">
              <label className="text-xl font-bold mr-2">IMC:</label>
              <h1 className="text-xl">
                {((
                  parseFloat(usuario.Peso) /
                  (parseFloat(usuario.Altura) * parseFloat(usuario.Altura))
                ).toFixed(2)).toString()}
              </h1>
            </div>
            <div className="col-span-3 flex flex-col justify-center items-center">
              <img
                src={`${usuario.FotoPerfil}`}
                alt="Imagen"
                className="h-60 w-60 rounded-full"
              />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default PrincipalPage;
