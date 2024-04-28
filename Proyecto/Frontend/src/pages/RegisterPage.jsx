import { useState } from "react";
import { set, useForm } from "react-hook-form";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Card } from "../components/Card";
import { Link } from "react-router-dom";
import { API_URL } from "./url";
import { ErrorModal } from "../components/ErrorModal";
import { NotificationModal } from "../components/NotificacionModal";
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
    console.log(data);
    try {
      const userResponse = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: data.name,
          apellido: data.apellido,
          correo: data.correo,
          contraseña: data.password,
          peso: data.peso,
          altura: data.altura,
          nivel: 1,
          foto: previewImage.split(",")[1],
        }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        setError("El usuario ya existe");
      } else {
        // Registro exitoso
        console.log("Usuario registrado correctamente");
        setNotification("Usuario registrado correctamente");
        setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <Card>
        <h1 className="text-2xl font-bold text-center">Registro</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center justify-center">
            <div className="flex flex-col mr-3">
              <Label htmlFor="name">Nombre:</Label>
              <Input
                type="text"
                name="name"
                {...register("name", { required: true })}
                placeholder="Nombre"
              />
              {errors.username && (
                <p style={{ color: "red" }}>El nombre es requerido.</p>
              )}
            </div>
            <div className="flex flex-col">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                type="text"
                name="apellido"
                {...register("apellido", { required: true })}
                placeholder="Apellido"
              />
              {errors.username && (
                <p style={{ color: "red" }}>El Nombre es requerido.</p>
              )}
            </div>
          </div>
          <Label htmlFor="correo">Correo Electrónico:</Label>
          <Input
            type="mail"
            name="correo"
            placeholder="example@mail.com"
            {...register("correo", { required: true })}
          />
          <div className="flex items-center justify-center">
            <div className="flex flex-col mr-3">
              <Label htmlFor="password">Contraseña:</Label>
              <Input
                type="password"
                name="password"
                placeholder="Escribe tu contraseña"
                {...register("password", { required: true, minLength: 6 })}
              />
            </div>
            <div className="flex flex-col">
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
            </div>
          </div>
          {passwordMismatch && (
            <p style={{ color: "red" }}>Las contraseñas no coinciden.</p>
          )}
          {errors.password_repeat && (
            <span className="text-red-500">
              {errors.password_repeat.message}
            </span>
          )}

          <div className="flex items-center justify-center">
            <div className="flex flex-col mr-3">
              <Label htmlFor="peso">Peso (kg):</Label>
              <Input
                type="text"
                name="peso"
                placeholder="Peso en lb"
                {...register("peso", { required: true })}
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="altura">Altura (m):</Label>
              <Input
                type="text"
                name="altura"
                placeholder="Altura en m"
                {...register("altura", { required: true })}
              />
            </div>
          </div>
          <div className="flex items-center justify-center my-3">
            <div className="flex flex-col mr-3">
              <Label htmlFor="image">Imagen de perfil:</Label>
              <Input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="w-24" // Ajusta el ancho del Input según lo deseado
              />
              {errors.username && (
                <p style={{ color: "red" }}>
                  La foto de perfil es obligatoria.
                </p>
              )}
            </div>

            <div className="flex flex-col">
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
            </div>
          </div>
          <Link className="text-xs block my-1 text-slate-300" to="/login">
            ¿Ya tienes cuenta? Ingresa
          </Link>
          <div className="flex items-center justify-center">
            <button className="bg-primary100 px-4 py-1 hover:bg-primary200 rounded-md my-1 w-full text-text100 font-semibold ">
              Regístrate
            </button>
          </div>
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
