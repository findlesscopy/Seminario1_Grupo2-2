import { Card } from "../components/ui/Card";
import { Navbar } from "../components/NavBar";
import Cookies from 'js-cookie';
import { API_URL } from "./url";
import { useEffect, useState } from 'react';

function PrincipalPage() {
  const username = Cookies.get('username');
  const id_usuario = Cookies.get('id');
  
  const [usuarioActivo, setUsuarioActivo] = useState({
    username: username,
    id_usuario: id_usuario,
    nombre: '',
    url_foto: ''
  });

  useEffect(() => {
    // Realizar la solicitud GET al servidor para obtener los datos del usuario
    fetch(`${API_URL}/obtener_usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, id_usuario: parseInt(id_usuario)})
    })
      .then(response => response.json())
      .then(data => {
        console.log('Datos del usuario:', data);
        setUsuarioActivo(prevState => ({
          ...prevState,
          nombre: data.nombre,
          url_foto: data.url_foto
        }));
      })
      .catch(error => console.error('Error al obtener datos del usuario:', error));
  }, [username]);
  console.log('Usuario activo:', usuarioActivo)

  return (
    <div>
      <Navbar />
      <div className="grid grid-cols-5 p-4">
        <div className="col-span-2 grid grid-cols-3 gap-5 ">
          <h1 className="text-xl font-bold col-span-3">Datos Personales:</h1>
          <div className="col-span-3 flex flex-col justify-center items-center">
            <label className="text-xl font-bold">Username:</label>
            
            <h1 className="text-xl ">{username}</h1>
          </div>
          <div className="col-span-3 flex flex-col justify-center items-center">
            <label className="text-xl font-bold">Nombre completo:</label>
            <h1 className="text-xl ">{usuarioActivo.nombre}</h1>
          </div>
          <div className="col-span-3 flex flex-col justify-center items-center ">
            <img
              src={usuarioActivo.url_foto}
              alt="Imagen"
              className="h-80 w-80 rounded-full"
            />
          </div>
          <div className="col-span-3 flex flex-col justify-center items-center">
            <button className="bg-blue-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300">
              <a href="/editar">Editar Perfil</a>
            </button>
          </div>
        </div>

        <div className="col-span-3 flex flex-col justify-center items-center">
          <Card>
            <h1 className="flex items-center justify-center borde text-2xl font-bold">
              {" "}
              Bienvenido a Faunadex
            </h1>

            <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full">
              <a href="/ver">Ver Fotos</a>
            </button>
            <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full">
              <a href="/subir">Subir Fotos</a>
            </button>
            <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full">
              <a href="/album">Editar Albumes</a>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PrincipalPage;
