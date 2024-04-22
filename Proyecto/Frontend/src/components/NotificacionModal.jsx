export const NotificationModal = ({ message, onClose }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-indigo-600 font-bold mb-2">Notificación</h2>
          <p className="text-gray-800">{message}</p>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md mt-4"
            onClick={onClose}
          >
            Entendido
          </button>
        </div>
      </div>
    );
  };
