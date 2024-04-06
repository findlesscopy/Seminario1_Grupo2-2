import { NavBarSimple } from "../components/NavBar";
import React, { useState } from "react";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";
import { API_URL } from "./url";
import { ErrorModal } from "../components/ui/ErrorModal";
import { NotificationModal } from "../components/ui/NotificacionModal";

function ExtraerPage() {
  const [previewImage, setPreviewImage] = useState(null);
  const [textoExtraido, setTextoExtraido] = useState("");
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

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
      const response = await fetch(`${API_URL}/obtener_texto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imagen: imagen64
        }),
      });
      const res = await response.json();
      console.log(res);
      setTextoExtraido(res.textos)
      setNotification("Texto extraido con éxito");
    } catch (error) {
      console.error("Error al subir la foto:", error);
      setError("Error al extraer texto de la foto");
    }
  };
  return (
    <>
      <div>
        <NavBarSimple />
        <div className="grid grid-cols-5 p-4">
          <div className="col-span-5 grid grid-cols-3 gap-2">
            <h1 className="font-bold">Cargue una imagen:</h1>
            <Card>
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
            </Card>
            
            <button className="col-span-3 bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300" onClick={onSubmit} >Extraer Texto</button>
            <textarea className="col-span-3 bg-zinc-800" rows="8" cols="50" defaultValue={textoExtraido}></textarea>
            
          </div>
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
    </>
  );
}

export default ExtraerPage;
