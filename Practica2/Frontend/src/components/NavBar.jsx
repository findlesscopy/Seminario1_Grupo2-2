import React from "react";
import {
  Navbar,
  Typography,
} from "@material-tailwind/react";
import Cookies from "js-cookie";


export function NavBarSimple() {
  const [openNav, setOpenNav] = React.useState(false);

  const handleWindowResize = () =>
    window.innerWidth >= 960 && setOpenNav(false);

  React.useEffect(() => {
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return (
    <Navbar className="mx-auto max-w-screen-2xl px-6 py-3 bg-zinc-800 border-none rounded-none" >
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography
          as="a"
          href="/"
          variant="h6"
          className="mr-4 cursor-pointer py-1.5 font-bold text-2xl"
        >
          Faunadex
        </Typography>
        <ul className="flex gap-6 text-white">
        <Typography
            as="li"
            variant="small"
            color="blue-gray"
            className="p-1 font-bold"
          >
            <a
              href="/principal"
              className="flex items-center hover:text-blue-500 transition-colors"
            >
              Principal
            </a>
          </Typography>
          <Typography
            as="li"
            variant="small"
            color="blue-gray"
            className="p-1 font-bold"
          >
            <a
              href="/ver"
              className="flex items-center hover:text-blue-500 transition-colors"
            >
              Ver Fotos
            </a>
          </Typography>
          <Typography
            as="li"
            variant="small"
            color="blue-gray"
            className="p-1 font-bold"
          >
            <a
              href="/subir"
              className="flex items-center hover:text-blue-500 transition-colors"
            >
              Subir Fotos
            </a>
          </Typography>
          <Typography
            as="li"
            variant="small"
            color="blue-gray"
            className="p-1 font-bold"
          >
            <a
              href="/extraer"
              className="flex items-center hover:text-blue-500 transition-colors"
            >
              Extraer Texto
            </a>
          </Typography>
          <Typography
            as="li"
            variant="small"
            color="blue-gray"
            className="p-1 font-bold"
          >
            <a
              href="/editar"
              className="flex items-center hover:text-blue-500 transition-colors"
            >
              Editar Perfil
            </a>
          </Typography>
          <Typography
            as="li"
            variant="small"
            color="blue-gray"
            className="p-1 font-bold"
          >
            <a
              href="/"
              className="flex items-center hover:text-blue-500 transition-colors"
              onClick={() => {
                Cookies.remove("username");
                Cookies.remove("id");
              } }
            >
              Cerrar Sesión
            </a>
          </Typography>
        </ul>
      </div>
    </Navbar>
  );
}