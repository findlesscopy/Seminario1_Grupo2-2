

export function Footer() {
    return (
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.</p>
          <p>Información de contacto: correo@example.com</p>
        </div>
      </footer>
    );
  }
