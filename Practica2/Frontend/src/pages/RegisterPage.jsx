import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { API_URL } from "./url";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

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
    var imagenSubida = false;
    console.log(previewImage.split(",")[1].length);
    try {
      const nombreFotoEnS3 = "Fotos_Perfil/" + data.username + cantidad;

      const params = {
        Bucket: nombreBucket,
        Key: nombreFotoEnS3,
        Body: previewImage.split(",")[1],
        ContentType: "image/jpeg", // Tipo de contenido de la imagen
      };
      s3.upload(params, (err, data) => {
        if (err) {
          console.error("Error al subir la foto a S3:", err);
          res.status(500).json({ error: "Error al subir la foto a S3" });
          return;
        } else {
          imagenSubida = true;
          console.log("Foto subida correctamente a S3:", data.Location);
          // URL de la foto en S3
          const url = data.Location;

          if (imagenSubida) {
            fetch(`${API_URL}/usuarios_crear`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: data.username,
                nombre: data.name,
                contraseña: data.password,
                url_foto: url,
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("El usuario ya existe");
                }
                return response.json();
              })
              .then((data) => {
                console.log("Usuario registrado correctamente");
                Cookies.set("id_usuario", data.id_usuario);
                Cookies.set("username", data.username);
                Cookies.set("nombre", data.name);
              })
              .catch((error) => {
                console.error("Error:", error);
                alert("El usuario ya existe");
              });
          }
        }
      });
    } catch (error) {
      console.error("Error al subir la foto a S3:", error);
      setError("Error al subir la foto a S3");
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
    </div>
  );
}

export default RegisterPage;
