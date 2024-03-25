import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { API_URL } from "./url";


function ErrorModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-zinc-800 p-4 rounded-md">
        <p className="text-white font-bold text-2xl">{message}</p>
        <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

function PasswordMismatchModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-zinc-800 p-4 rounded-md">
        <p className="text-white font-bold text-2xl">Las contraseñas no coinciden</p>
        <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

function LoginPage() {
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
  const confirmPassword = watch("password_repeat", ""); // Obtener el valor del campo de confirmación de contraseña

  // Función de validación personalizada para verificar que las contraseñas coincidan
  const validatePasswordMatch = (value) => {
    const match = value === password;
    setPasswordMismatch(!match);
    return match;
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_URL}/usuarios_crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: data.username,
          nombre: data.name,
          contraseña: data.password
        })
      });

      if (!response.ok) {
        // Error al registrar
        const errorData = await response.json();
        setError("El usuario ya existe");
      } else {
        // Registro exitoso
        console.log('Usuario registrado correctamente');
        const id_usuario = await response.json();
        console.log('id_usuarioaaaaaaaaaaaaaaa:', id_usuario);

        Cookies.set('id_usuario', id_usuario.id_usuario);
        Cookies.set('username', data.username);
        Cookies.set('nombre', data.name);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    
    const id = Cookies.get('id_usuario');
    const username = Cookies.get('username');

    try {
      console.log('id:', id);
      console.log('username:', username);
      const response = await fetch(`${API_URL}/fotos-perfil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': `${previewImage.split(',')[1].length}`
        },
        body: JSON.stringify({
          nombre: username,
          imagenBase64: previewImage.split(',')[1],
          id_usuario: parseInt(id)
        })
      });

      if (!response.ok) {
        // Error al registrar
        const errorData = await response.json();
        setError("Error al subir la imagen");
      } else {
        // Registro exitoso
        console.log('Imagen subida correctamente');
    
      }
    } catch (error) {
      console.error('Error:', error);
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

          <Label htmlFor="name">Nombre Completo:</Label>
          <Input
            type="text"
            name="name"
            {...register("name", { required: true })}
            placeholder="Nombre Completo"
          />

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
            <PasswordMismatchModal onClose={() => setPasswordMismatch(false)} />
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
    </div>
  );
}

export default LoginPage;
