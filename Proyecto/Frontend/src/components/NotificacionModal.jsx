export const NotificationModal = ({ message, onClose }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-bg300 p-4 rounded-md shadow-md">
          <h2 className="text-text100 font-bold mb-2">Notificación</h2>
          <p className="text-text200">{message}</p>
          <button
            className="bg-primary100 text-text100 px-4 py-2 rounded-md mt-4"
            onClick={onClose}
          >
            Entendido
          </button>
        </div>
      </div>
    );
  };
