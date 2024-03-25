import { Navbar } from "../components/NavBar";
import { useForm } from "react-hook-form";
import { useState, Fragment } from "react";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { API_URL } from "./url";

function UploadPage() {
  const { register, handleSubmit } = useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const [nombresAlbumes, setNombresAlbumes] = useState([{name: "Seleccione un Álbum"}]);
  const [selected, setSelected] = useState(nombresAlbumes[0]);

  const username = Cookies.get("username");
  const id_usuario = Cookies.get("id");

  const [usuarioActivo, setUsuarioActivo] = useState({
    username: username,
    id_usuario: id_usuario,
    nombre: "",
    url_foto: "",
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const subirFoto = (event) => {
    event.preventDefault(); // Evita que se recargue la página al hacer clic en el botón
    const fotoName = event.target.form.fotoName.value;
    const id_usuario = Cookies.get("id");
    const imagen64 = previewImage.split(',')[1];
    const nombre_album = selected.name;

    fetch(`${API_URL}/crear_foto_albumes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_usuario: parseInt(id_usuario),
        nombre: fotoName,
        imagenBase64: imagen64,
        nombre_album: nombre_album,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) =>
        console.error("Error al subir la foto:", error)
      );
  }

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
  }, []); // <- Array vacío significa que el efecto se ejecutará solo una vez, después del montaje del componente

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
      <div className="grid grid-cols-5 ">
        <div className="col-span-2 flex flex-col justify-center items-center">
          <img
            src={usuarioActivo.url_foto}
            alt="Imagen"
            className="h-80 w-80 rounded-full "
          />
        </div>
        <div className="col-span-3 flex flex-col justify-start items-start">
          <Card>
            <form
              onSubmit={handleSubmit(subirFoto)}
            >
              <Label htmlFor="fotoName">Nombre de la Foto:</Label>
              <Input
                type="text"
                name="fotoName"
                {...register("fotoName", { required: true })}
                placeholder="Nombre de la foto"
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
              <Label htmlFor="image">Imagen de perfil:</Label>
              <Input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*" // Solo permite archivos de imagen
              />
              <Label htmlFor="image">Vista previa:</Label>
              <div className="flex items-center justify-center borde">
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ maxWidth: "100px" }}
                  />
                )}
              </div>
              <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300" onClick={subirFoto} >Cargar Foto</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
