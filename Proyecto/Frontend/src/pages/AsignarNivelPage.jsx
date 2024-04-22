import { Card } from "../components/Card";
import Navbar from "../components/NavbarAdmin";
import { Label } from "../components/Label";

export default function RutinasAdm() {
  return (
    <>
      <Navbar />
      <div className="h-screen flex flex-col justify-center items-center -mt-16 ">
        <Card>
          <h1 className="text-2xl font-bold text-center">Asignar un nivel:</h1>
          <br />
          <form>
            <Label htmlFor="nombre">Nombre:</Label>
            <select
              id="nombre"
              name="nombre"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="1">Juan</option>
              <option value="2">Pedro</option>
              <option value="3">Maria</option>
              <option value="4">Ana</option>
            </select>
            <Label htmlFor="nivel">Nivel:</Label>
            <select
              id="nivel"
              name="nivel"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="1">Nivel 1</option>
              <option value="2">Nivel 2</option>
              <option value="3">Nivel 3</option>
            </select>
            <br />
            <button
              className="bg-primary100 px-4 py-1 hover:bg-primary200 rounded-md my-1 w-full text-text100 font-semibold "
            >
              Asignar nivel
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
