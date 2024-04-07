import React, { useState } from "react";

export function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false); // Estado para controlar si el chat está abierto o cerrado

  // Función para enviar un mensaje al bot
  const sendMessage = async () => {
    if (inputMessage.trim() !== "") {
      // Agregar el mensaje enviado por el usuario a la lista de mensajes
      setMessages([...messages, { text: inputMessage, sender: "user" }]);
      // Enviar el mensaje al servicio de Amazon Lex
      try {
        const response = await sendMessageToLex(inputMessage);
        // Agregar la respuesta del bot a la lista de mensajes
        setMessages([...messages, { text: response, sender: "bot" }]);
      } catch (error) {
        console.error("Error al enviar mensaje al bot:", error);
      }
      // Limpiar el campo de entrada después de enviar el mensaje
      setInputMessage("");
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
