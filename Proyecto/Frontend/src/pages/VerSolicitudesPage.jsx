import NavbarAdmin from "../components/NavbarAdmin";
import { useState, useEffect } from "react";
import { API_URL } from "./url";
import { ErrorModal } from "../components/ErrorModal";
import { NotificationModal } from "../components/NotificacionModal";
import Cookies from "js-cookie";

export default function VerSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const rutinas = async () => {
      const response = await fetch(`${API_URL}/solicitudes`);
      const data = await response.json();
      setSolicitudes(data);
    };
    rutinas();
  }, []);

  const handleAceptar = async (id) => {
    try {
      const response = await fetch(`${API_URL}/aceptar_solicitud/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al aceptar la solicitud");
      }

      setNotification("La solicitud ha sido aceptada correctamente");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al aceptar la solicitud");
    }
  };

  const handleRechazar = async (id) => {
    try {
      const response = await fetch(`${API_URL}/rechazar_solicitud/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al rechazar la solicitud");
      }

      setNotification("La solicitud ha sido rechazada correctamente");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al rechazar la solicitud");
    }
  };

  return (
    <>
      <NavbarAdmin />
      <div className=" grid grid-cols-5 p-4 gap-4 ">
        <h1 className="text-2xl col-span-5  font-bold text-center">
          Solicitudes hechas por los usuarios
        </h1>

        <table className="bg-bg300 w-full col-span-5 text-sm text-center rtl:text-right text-text200 ">
          <thead className="bg-bg200 text-xs text-text100 uppercase">
            <tr>
              <th scope="col" className="px-6 py-3">
                ID
              </th>
              <th scope="col" className="px-6 py-3">
                Correo
              </th>
              <th scope="col" className="px-6 py-3">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3">
                Nivel Solicitado
              </th>
              <th scope="col" className="px-6 py-3">
                Estado
              </th>
              <th scope="col" className="px-6 py-3">
                Fecha de solicitud
              </th>
              <th scope="col" className="px-6 py-3">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-bg300">
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.ID}>
                <td className="px-6 py-4 whitespace-nowrap">{solicitud.ID}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {solicitud.CorreoUsuario}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {solicitud.NombreUsuario}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {solicitud.NivelSolicitado}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {solicitud.Estado}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(solicitud.FechaSolicitud).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-4"
                    onClick={() => handleAceptar(solicitud.ID)}
                  >
                    Aceptar
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleRechazar(solicitud.ID)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      {notification && (
        <NotificationModal
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}
