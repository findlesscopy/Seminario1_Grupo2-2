import { Card } from "../components/ui/Card";

function MainPage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <Card>
        <h1 className="flex items-center justify-center borde text-2xl font-bold">
          Bienvenido a Faunadex
        </h1>
        <div className="flex items-center justify-center">
          <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full">
            <a href="/register">Registrarse</a>
          </button>
        </div>
        <div className="flex items-center justify-center">
          <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full">
            <a href="/login">Iniciar Sesión</a>
          </button>
        </div>
      </Card>
    </div>
  );
}

export default MainPage;
