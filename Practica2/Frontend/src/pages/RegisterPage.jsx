import { useState } from "react";
import { set, useForm } from "react-hook-form";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";
import { Link } from "react-router-dom";
import { API_URL } from "./url";
import { ErrorModal } from "../components/ui/ErrorModal";
import { NotificationModal } from "../components/ui/NotificacionModal";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [notification, setNotification] = useState(null);

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

  const password = watch("password", ""); // Obtener el valor del campo de contraseña

  // Función de validación personalizada para verificar que las contraseñas coincidan
  const validatePasswordMatch = (value) => {
    const match = value === password;
    setPasswordMismatch(!match);
    return match;
  };

  const onSubmit = async (data) => {
    console.log(previewImage.split(",")[1].length);
    try {
      const userResponse = await fetch(`${API_URL}/usuarios_crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          nombre: data.name,
          contraseña: data.password,
        }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        setError("El usuario ya existe");
      } else {
        // Registro exitoso
        console.log("Usuario registrado correctamente");
        const id_usuario = await userResponse.json();
        // Subir la imagen
        const imageResponse = await fetch(`${API_URL}/fotos-perfil`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": `${previewImage.split(",")[1].length}`,
          },
          body: JSON.stringify({
            nombre: data.username, // Utiliza el nombre de usuario del formulario
            imagenBase64: previewImage.split(",")[1],
            id_usuario: parseInt(id_usuario.id_usuario),
          }),
        });

        // Verifica si la imagen se subió correctamente
        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          setError("Error al subir la imagen");
          return; // Termina la función si hay un error al subir la imagen
        } else {
          console.log("Imagen subida correctamente");
          setNotification("Usuario registrado correctamente");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <Card>
        <h1 className="text-2xl font-bold">Registro</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Label htmlFor="username">Username:</Label>
          <Input
            type="text"
            name="username"
            {...register("username", { required: true })}
            placeholder="Username"
          />
          {errors.username && (
            <p style={{ color: "red" }}>El username es requerido.</p>
          )}
          <Label htmlFor="name">Nombre Completo:</Label>
          <Input
            type="text"
            name="name"
            {...register("name", { required: true })}
            placeholder="Nombre Completo"
          />
          {errors.username && (
            <p style={{ color: "red" }}>El Nombre es requerido.</p>
          )}
          <Label htmlFor="password">Contraseña:</Label>
          <Input
            type="password"
            name="password"
            placeholder="Escribe tu contraseña"
            {...register("password", { required: true, minLength: 6 })}
          />

          <Label htmlFor="password_repeat">Confirma tu contraseña:</Label>
          <Input
            type="password"
            name="password_repeat"
            placeholder="Escribe nuevamente tu contraseña"
            {...register("password_repeat", {
              required: true,
              minLength: 6,
              validate: validatePasswordMatch,
            })}
          />
          {passwordMismatch && (
            <p style={{ color: "red" }}>Las contraseñas no coinciden.</p>
          )}
          {errors.password_repeat && (
            <span className="text-red-500">
              {errors.password_repeat.message}
            </span>
          )}

          <Label htmlFor="image">Imagen de perfil:</Label>
          <Input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*" // Solo permite archivos de imagen
          />
          {errors.username && (
            <p style={{ color: "red" }}>La foto de perfil es obligatoria.</p>
          )}
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
          <Link className="text-xs block my-1 text-slate-300" to="/login">
            ¿Ya tienes cuenta? Ingresa
          </Link>
          <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300">
            Registrar
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
  );
}

export default RegisterPage;