import Navbar from "../components/Navbar";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { NotificationModal } from "../components/NotificacionModal";
import { useState } from "react";
import { set } from "react-hook-form";

export default function FitzyPage() {
  const [notification, setNotification] = useState(null);

  const handlePreguntar = () => {
    fetch(
      `https://8iryhbb2nh.execute-api.us-east-1.amazonaws.com/mensajeGemini`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pregunta: document.querySelector("input[name=pregunta]").value,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setNotification(data.respuesta);
      });
  };

  return (
    <>
      <Navbar />
      <div className=" flex flex-col justify-center items-center mt-10 ">
        <Card>
          <h1 className="text-2xl font-bold text-center">Fitzy</h1>
          <br></br>
          <input
            type="text"
            name="pregunta"
            placeholder="Pregunta sobre los ejercicios"
            className="w-full bg-bg300 text-text200 px-4 py-2 rounded-md"
          />
          <button
            className="bg-primary100 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300 w-full text-text-100"
            onClick={handlePreguntar}
          >
            Preguntar
          </button>
        </Card>
        {notification && (
          <NotificationModal
            message={notification}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </>
  );
}
