import { Card } from "../components/Card";

function MainPage() {
  return (
    <>
      <div className="h-screen flex flex-col justify-center items-center">
        <Card>
          <h1 className="text-text200 flex items-center justify-center borde text-2xl font-bold">
            Bienvenido a FitHub
          </h1>
          <div className="flex items-center justify-center">
            <button className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full text-text100">
              <a href="/register">Registrarse</a>
            </button>
          </div>
          <div className="flex items-center justify-center">
            <button className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full text-text100">
              <a href="/login">Iniciar Sesión</a>
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default MainPage;
