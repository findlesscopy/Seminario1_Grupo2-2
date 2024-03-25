import { Navbar } from "../components/NavBar";
import { set, useForm } from "react-hook-form";
import { useState, Fragment, useEffect } from "react";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Cookies from "js-cookie";
import { API_URL } from "./url";


function AlbumPage() {
  const { register, handleSubmit } = useForm();
  const [nombresAlbumes, setNombresAlbumes] = useState([{name: "Seleccione un Álbum"}]);
  const [selected, setSelected] = useState(nombresAlbumes[0]);

  const crearAlbum = (event) => {
    event.preventDefault(); // Evita que se recargue la página al hacer clic en el botón
    const albumName = event.target.form.albumname.value;
    const id_usuario = Cookies.get("id");
    
    fetch(`${API_URL}/crear_album`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id_usuario: parseInt(id_usuario), nombre: albumName })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        
      })
      .catch(error => console.error('Error al comprobar contraseña:', error));
  };

  const editarAlbum = (event) => {
    event.preventDefault(); // Evita que se recargue la página al hacer clic en el botón
    const albumName = event.target.form.albumname.value;
    const id_usuario = Cookies.get("id");
    console.log(albumName, id_usuario);
    fetch(`${API_URL}/modificar_album`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id_album: parseInt(selected.id), nombre: albumName })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        
      })
      .catch(error => console.error('Error al comprobar contraseña:', error));
  }

  const eliminarAlbum = (event) => {
    event.preventDefault(); // Evita que se recargue la página al hacer clic en el botón
    const id_usuario = Cookies.get("id");
    
    fetch(`${API_URL}/eliminar_album`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id_usuario: parseInt(id_usuario), nombre: selected.name })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      
      })
      .catch(error => console.error('Error al comprobar contraseña:', error));
  }
    

  useEffect(() => {
    // Realizar la solicitud GET al servidor para obtener los datos de los albumes del usuario
    const id_usuario = Cookies.get("id");
    fetch(`${API_URL}/obtener_albumes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_usuario: parseInt(id_usuario) }),
    })
      .then((response) => response.json())
            .then((data) => {
              for (let i = 0; i < data.length; i++) {
                setNombresAlbumes((prev) => {
                  // Verificar si el nombre ya existe en el array
                  if (!prev.some(album => album.name === data[i][1])) {
                    // Si no existe, agregarlo al array
                    return [...prev, { name: data[i][1], id: data[i][0] }];
                  } else {
                    // Si existe, devolver el array sin cambios
                    return prev;
                  }
                });
              }
            })
            .catch((error) =>
              console.error("Error al obtener datos de los albumes:", error)
            );
  }, []);
  
  

  return (
    <div>
      <Navbar />
      <div className="grid grid-cols-4 ">
        <div className="col-span-4 flex flex-col justify-center items-center">
          <Card>
            <h1 className="text-2xl font-bold">Album Manager</h1>
            <form>
              <Label htmlFor="albumname">Nombre del Album:</Label>
              <Input
                type="text"
                name="albumname"
                {...register("albumname", { required: true })}
                placeholder="Nombre del Album"
              />
              <Label htmlFor="password">Álbum:</Label>
              <Listbox value={selected} onChange={setSelected}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-zinc-700 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">{selected.name}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                      {nombresAlbumes.map((person, personIdx) => (
                        <Listbox.Option
                          key={personIdx}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-gray-400 text-white"
                                : "text-gray-900"
                            }`
                          }
                          value={person}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {person.name}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
              <div className="flex flex-row justify-center items-center p-4 gap-4">
                <button
                  className="bg-green-800 px-4 py-1 rounded-md my-2"
                  onClick={crearAlbum}
                >
                  Agregar
                </button>
                <button className="bg-red-800 px-4 py-1 rounded-md my-2" onClick={eliminarAlbum}>
                  Eliminar
                </button>
                <button className="bg-blue-800 px-4 py-1 rounded-md my-2" onClick={editarAlbum}>
                  Editar
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AlbumPage;
