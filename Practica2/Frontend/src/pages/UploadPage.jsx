import { NavBarSimple } from "../components/NavBar";
import { useForm } from "react-hook-form";
import { useState, Fragment } from "react";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { API_URL } from "./url";
import { Textarea } from "@material-tailwind/react";

function UploadPage() {
  const { register, handleSubmit } = useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const [nombresAlbumes, setNombresAlbumes] = useState([
    { name: "Seleccione un Álbum" },
  ]);
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
    const imagen64 = previewImage.split(",")[1];
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
      .catch((error) => console.error("Error al subir la foto:", error));
  };

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
            if (!prev.some((album) => album.name === data[i][1])) {
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
    <>
      <div>
        <NavBarSimple />
        <div className="grid grid-cols-5 p-4">
          <div className="col-span-5 grid grid-cols-3 gap-4">
            <h1 className="font-bold">Cargue una imagen:</h1>
            <Card>
              <form onSubmit={subirFoto}>
                <Label htmlFor="nombre_foto">Nombre de la imagen:</Label>
                <Input
                  type="text"
                  name="nombre_foto"
                  placeholder="Nombre de la imagen"
                />
                <Label htmlFor="descripcion">Descripción:</Label>
                <Textarea
                  name="descripcion"
                  type="text"
                  className="bg-gray-500 w-full p-2 "
                  rows="8"
                  placeholder=" Escribe la descripción de la imagen"
                />
                <Label htmlFor="image">Imagen:</Label>
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
                <div className="flex flex-col justify-center items-center">
                  <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300">
                    Subir
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default UploadPage;
