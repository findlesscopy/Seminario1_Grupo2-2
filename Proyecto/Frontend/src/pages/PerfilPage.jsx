import Navbar from "../components/Navbar";
import { Card } from "../components/Card";
import { Label } from "../components/Label";
import { Input } from "../components/Input";
import { API_URL } from "./url";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";

export default function PerfilPage() {
  const handleSolicitar = () => {
    fetch(`${API_URL}/solicitar_subir_nivel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_usuario: 1, //Cookies.get("id_usuario"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });

    fetch(
      `https://cbkfsop261.execute-api.us-east-1.amazonaws.com/EnviarCorreo`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          destinatario: "gym_fithub_semi1_grupo2@outlook.es",
          asunto: "[FITHUB] Solicitud de subir nivel de rutina",
          mensaje:
            "El usuario con id " +
            id_usuario +
            " solicita subir de nivel de rutina",
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        alert("Solicitud enviada");
      });
  };

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
      <div className=" flex flex-col justify-center items-center mt-10 ">
        <Card>
          <h1 className="text-2xl font-bold text-center">
            Información de Perfil
          </h1>
          <br />
          {usuario.map((usuario) => (
            <form key={usuario.ID}>
              <div className="flex items-center justify-center">
                <div className="flex flex-col mr-3">
                  <Label htmlFor="name">Nombre:</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    defaultValue={usuario.Nombre}
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    defaultValue={usuario.Apellido}
                  />
                </div>
              </div>
              <Label htmlFor="correo">Correo Electrónico:</Label>
              <Input
                type="mail"
                name="correo"
                placeholder="example@mail.com"
                disabled={true}
                defaultValue={usuario.CorreoElectronico}
              />
              <div className="flex items-center justify-center">
                <div className="flex flex-col mr-3">
                  <Label htmlFor="peso">Peso (kg):</Label>
                  <Input
                    type="text"
                    name="peso"
                    placeholder="Peso en lb"
                    defaultValue={usuario.Peso}
                  />
                </div>
                <div className="flex flex-col mr-3">
                  <Label htmlFor="altura">Altura (m):</Label>
                  <Input
                    type="text"
                    name="altura"
                    placeholder="Altura en m"
                    defaultValue={usuario.Altura}
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="altura">IMC:</Label>
                  <Input
                    type="text"
                    name="altura"
                    placeholder="IMC"
                    disabled={true}
                    defaultValue={(
                      parseFloat(usuario.Peso) /
                      (parseFloat(usuario.Altura) * parseFloat(usuario.Altura))
                    )
                      .toFixed(2)
                      .toString()}
                  />
                </div>
              </div>
              <br />
              <div className="flex items-center justify-center">
                <button className="bg-primary100 px-4 py-1 hover:bg-primary200 rounded-md my-1 w-full text-text100 font-semibold ">
                  Editar Perfil
                </button>
              </div>
            </form>
          ))}

          <div className="flex items-center justify-center">
            <button
              className="bg-primary100 px-4 py-1 hover:bg-primary200 rounded-md my-1 w-full text-text100 font-semibold "
              onClick={handleSolicitar}
            >
              Subir el nivel de tu rutina
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
