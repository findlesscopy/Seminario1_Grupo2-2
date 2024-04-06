import { NavBarSimple } from "../components/NavBar";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";
import Cookies from "js-cookie";
import { API_URL } from "./url";
import { Textarea } from "@material-tailwind/react";
import { ErrorModal } from "../components/ui/ErrorModal";
import { NotificationModal } from "../components/ui/NotificacionModal";

function UploadPage() {
  const [previewImage, setPreviewImage] = useState(null);
  const { register, handleSubmit } = useForm(); // Obtén la función register y handleSubmit de React Hook Form
  const id_usuario = Cookies.get("id");
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    imagen: null,
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

  const onSubmit = async (data) => {
    console.log(data); // Imprime los datos del formulario
    // Resto del código para enviar la información al servidor...
    const imagen64 = previewImage.split(",")[1];
    //console.log(data.nombre_foto);
    //console.log(data.descripcion);

    try {
      const response = await fetch(`${API_URL}/albumes_rekognition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: parseInt(id_usuario),
          imagen: imagen64,
          nombreImagen: data.nombre_foto,
          descripcion: data.descripcion,
        }),
      });
      const res = await response.json();
      console.log(res);
      setNotification("Imagen subida con éxito");
    } catch (error) {
      console.error("Error al subir la foto:", error);
      setError("Error al subir la foto");
    }
  };

  return (
    <>
      <div>
        <NavBarSimple />
        <div className="grid grid-cols-5 p-4">
          <div className="col-span-5 grid grid-cols-3 gap-4">
            <h1 className="font-bold">Cargue una imagen:</h1>
            <Card>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Label htmlFor="nombre_foto">Nombre de la imagen:</Label>
                <Input
                  type="text"
                  name="nombre_foto"
                  placeholder="Nombre de la imagen"
                  {...register("nombre_foto")} // Registra el campo de entrada con React Hook Form
                />
                <Label htmlFor="descripcion">Descripción:</Label>
                <Textarea
                  name="descripcion"
                  type="text"
                  className="bg-gray-500 w-full p-2"
                  rows="8"
                  placeholder="Escribe la descripción de la imagen"
                  {...register("descripcion")} // Registra el campo de entrada con React Hook Form
                />
                <Label htmlFor="image">Imagen:</Label>
                <Input
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
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
            {error && (
              <ErrorModal message={error} onClose={() => setError(null)} />
            )}
            {notification && (
              <NotificationModal
                message={notification}
                onClose={() => setNotification(null)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UploadPage;
