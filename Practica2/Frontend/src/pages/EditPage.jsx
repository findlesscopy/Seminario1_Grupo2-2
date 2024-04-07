import { Card } from "../components/ui/Card";
import { NavBarSimple } from "../components/NavBar";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { API_URL } from "./url";
import { ErrorModal } from "../components/ui/ErrorModal";
import { NotificationModal } from "../components/ui/NotificacionModal";

function EditPage() {
  const { register, handleSubmit } = useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const [contrasniaValidada, setContraseniaValidada] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
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

  useEffect(() => {
    // Realizar la solicitud GET al servidor para obtener los datos del usuario
    console.log("id:", id_usuario);
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

  const handleComprobarContrasenia = (event) => {
    event.preventDefault(); // Evita que se recargue la página al hacer clic en el botón
    const password = event.target.form.password.value;
    fetch(`${API_URL}/validar-contrasena`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_usuario: parseInt(usuarioActivo.id_usuario),
        contraseña: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log("Contraseña correcta:", data);
        if (data.ok) {
          setNotification("Contraseña correcta");
          setContraseniaValidada(true);
        } else {
          setError("Contraseña incorrecta");
        }
      })
      .catch((error) => console.error("Error al comprobar contraseña:", error));
  };

  const onSubmit = async (data) => {
    if (!contrasniaValidada) {
      setNotification("Primero debes comprobar la contraseña");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/actualizar_datos`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          nombre: data.name,
          id_usuario: usuarioActivo.id_usuario,
        }),
      });

      if (!response.ok) {
        // Error al registrar
        const errorData = await response.json();
        setError("El usuario ya existe");
      } else {
        // Registro exitoso
        console.log("Usuario actualizado correctamente");
        setNotification("Usuario actualizado correctamente");
        const respuesta = await response.json();
        console.log(respuesta);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    try {
      console.log("id:", id_usuario);
      console.log("username:", username);
      const response = await fetch(`${API_URL}/fotos-perfil`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": `${previewImage.split(",")[1].length}`,
        },
        body: JSON.stringify({
          nombre: usuarioActivo.username,
          imagenBase64: previewImage.split(",")[1],
          id_usuario: parseInt(usuarioActivo.id_usuario),
        }),
      });

      if (!response.ok) {
        // Error al registrar
        const errorData = await response.json();
        setError("Error al subir la imagen");
      } else {
        // Registro exitoso
        console.log("Imagen subida correctamente");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <NavBarSimple />
      <div className="flex flex-col justify-center items-center">
        <Card>
          <h1 className="text-2xl font-bold">Editar</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="username">Nuevo username:</Label>
            <Input
              type="text"
              name="username"
              defaultValue={usuarioActivo.username}
              {...register("username", { required: true })}
              placeholder="Username"
            />

            <Label htmlFor="name">Nuevo nombre completo:</Label>
            <Input
              type="text"
              name="name"
              defaultValue={usuarioActivo.nombre}
              {...register("name", { required: true })}
              placeholder="Nombre Completo"
            />
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
            <Label htmlFor="password">
              {" "}
              Confirme contraseña para guardar cambios:
            </Label>
            <Input
              type="password"
              name="password"
              placeholder="Escribe tu contraseña"
              {...register("password", { required: true, minLength: 6 })}
            />
            <button
              className="bg-green-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300"
              onClick={handleComprobarContrasenia}
            >
              {" "}
              Comprobar Contraseña
            </button>
            <br />
            <button
              className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300"
              onSubmit={onSubmit}
            >
              Editar Información
            </button>
          </form>
        </Card>
        {error && <ErrorModal message={error} onClose={() => setError(null)} />}
        {notification && (
          <NotificationModal
            message={notification}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
}

export default EditPage;
