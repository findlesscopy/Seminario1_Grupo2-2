export const InformacionModal = ({ foto, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-md shadow-md">
        <h1 className="text-indigo-600 font-bold mb-2">{foto.nombre}</h1>
        <p className="text-gray-800">{foto.descripcion}</p>
        <img
          src={foto.url}
          alt={foto.descripcion}
          style={{ width: "100px", height: "100px" }}
        />
        <button>Traducir</button>
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
