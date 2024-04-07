import React, { useState } from "react";
import Cookies from "js-cookie";
import { API_URL } from "../../pages/url";

export function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false); // Estado para controlar si el chat está abierto o cerrado
  const id_usuario = Cookies.get("id");

  // Función para enviar un mensaje al bot
  const sendMessage = async () => {
    if (inputMessage.trim() !== "") {

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputMessage, sender: "user" },
      ]);
      // Enviar el mensaje al servicio de Amazon Lex
      try {
        const response = await fetch(`${API_URL}/obtener_mensaje_bot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: inputMessage,
            sessionId: 'id-'+id_usuario,
          }),
        });

        const data = await response.json();
        console.log(data);

        if(data.estado_session == 'Close'){
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: "La conversación ha finalizado", sender: "bot" },
          ]);
          setInputMessage("");
          return;
        }else{
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: data.mensaje, sender: "bot" },
          ]);
          setInputMessage("");
        }
        
      } catch (error) {
        console.error("Error al enviar mensaje al bot:", error);
      }
    }
  };

  // Manejar el cambio en el campo de entrada
  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
  };

  // Manejar el envío del formulario (cuando se presiona Enter)
  const handleFormSubmit = (event) => {
    event.preventDefault(); // Evitar que el formulario se envíe por defecto
    sendMessage(); // Llamar a la función para enviar el mensaje
  };

  // Función para alternar entre abrir y cerrar el chat
  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  return (
    <div className="chatbot-container">
      {/* Botón de alternancia del chat */}
      <button className="chatbot-toggle" onClick={toggleChat}>
        {chatOpen ? "Cerrar chat" : "Abrir chat"}
      </button>

      {/* Cuadro de chat */}
      {chatOpen && (
        <div className="chatbot-chatbox">
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === "user" ? "user" : "bot"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <form className="chatbot-input-form" onSubmit={handleFormSubmit}>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={inputMessage}
                onChange={handleInputChange}
              />
              <button type="submit">Enviar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
