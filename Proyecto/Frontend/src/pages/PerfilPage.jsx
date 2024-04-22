import Navbar from "../components/Navbar";
import { Card } from "../components/Card";
import { Label } from "../components/Label";
import { Input } from "../components/Input";
import { API_URL } from "./url";
import Cookies from "js-cookie";

export default function PerfilPage() {
  
  const handleSolicitar = () => {
    fetch(`${API_URL}/solicitar_subir_nivel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_usuario: 1 //Cookies.get("id_usuario"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        alert("Solicitud enviada");
      });
  };

  return (
    <>
      <Navbar />
      <div className=" flex flex-col justify-center items-center mt-10 ">
        <Card>
          <h1 className="text-2xl font-bold text-center">
            Información de Perfil
          </h1>
          <br />
          <form>
            <div className="flex items-center justify-center">
              <div className="flex flex-col mr-3">
                <Label htmlFor="name">Nombre:</Label>
                <Input type="text" name="name" placeholder="Nombre" />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="apellido">Apellido</Label>
                <Input type="text" name="apellido" placeholder="Apellido" />
              </div>
            </div>
            <Label htmlFor="correo">Correo Electrónico:</Label>
            <Input
              type="mail"
              name="correo"
              placeholder="example@mail.com"
              disabled={true}
            />
            <div className="flex items-center justify-center">
              <div className="flex flex-col mr-3">
                <Label htmlFor="peso">Peso (kg):</Label>
                <Input type="text" name="peso" placeholder="Peso en lb" />
              </div>
              <div className="flex flex-col mr-3">
                <Label htmlFor="altura">Altura (m):</Label>
                <Input type="text" name="altura" placeholder="Altura en m" />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="altura">IMC:</Label>
                <Input type="text" name="altura" placeholder="IMC" disabled={true}/>
              </div>
            </div>
            <br />
            <div className="flex items-center justify-center">
              <button className="bg-primary100 px-4 py-1 hover:bg-primary200 rounded-md my-1 w-full text-text100 font-semibold ">
                Editar Perfil
              </button>
            </div>
          </form>
          <div className="flex items-center justify-center">
            <button className="bg-primary100 px-4 py-1 hover:bg-primary200 rounded-md my-1 w-full text-text100 font-semibold " onClick={handleSolicitar}>
              Subir el nivel de tu rutina
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
