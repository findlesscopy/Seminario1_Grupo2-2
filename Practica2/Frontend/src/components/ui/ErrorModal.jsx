export const ErrorModal = ({ message, onClose }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-gray-500 p-4 rounded-md shadow-md">
          <h2 className="text-red-600 font-bold mb-2">Error</h2>
          <p className="text-gray-800">{message}</p>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-md mt-4"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };