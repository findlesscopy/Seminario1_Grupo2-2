import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { API_URL } from "./url";
import { NavBarSimple } from "../components/NavBar";
import { useNavigate } from "react-router-dom";

function VerPage() {
  const [fotosPerfil, setFotosPerfil] = useState([]);
  const [otrosAlbumes, setOtrosAlbumes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const id_usuario = Cookies.get("id");

        // Obtener fotos de perfil
        const responseFotosPerfil = await fetch(
          `${API_URL}/obtener_fotos_perfil`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: parseInt(id_usuario) }),
          }
        );
        const dataFotosPerfil = await responseFotosPerfil.json();
        setFotosPerfil(dataFotosPerfil.map((foto) => foto.url_foto));

        // Obtener primer álbum
        const responseAlbumes = await fetch(`${API_URL}/obtener_albumes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_usuario: parseInt(id_usuario) }),
        });
        const dataAlbumes = await responseAlbumes.json();

        // Obtener otros álbumes
        if (dataAlbumes.length > 0) {
          const albumes = [];
          for (let i = 0; i < dataAlbumes.length; i++) {
            const album = {
              nombre: dataAlbumes[i].nombre,
              fotos: [],
            };
            // Obtener fotos de otros álbumes
            const responseFotosAlbum = await fetch(
              `${API_URL}/obtener_fotos_album`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_album: dataAlbumes[i].id_album }),
              }
            );
            const dataFotosAlbum = await responseFotosAlbum.json();
            album.fotos = dataFotosAlbum.map((foto) => ({
              nombre: foto.nombre,
              url: foto.url_foto,
              descripcion: foto.descripcion,
            }));
            albumes.push(album);
          }
          setOtrosAlbumes(albumes);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    obtenerDatos();
  }, []);

  function verInformacion(foto){
    Cookies.set('foto_actual_nombre', foto.nombre)
    Cookies.set('foto_actual_descripcion', foto.descripcion)
    Cookies.set('foto_actual_url', foto.url)
    
    navigate('/detalle')
  }

  return (
    <>
      <div>
        <NavBarSimple />
        <div className="flex justify-center items-center">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Álbumes</h1>
            <div className="bg-zinc-800 max-w-md p-10 rounded-md">
              <h2 className="text-2xl font-bold mb-4">
                Álbum de fotos de Perfil
              </h2>
              <div className="flex gap-8">
                {fotosPerfil.map((foto, index) => (
                  <div key={index}>
                    <h3 className="font-bold">Foto de perfil {index + 1}</h3>
                    <img
                      src={foto}
                      alt={`Foto de perfil ${index + 1}`}
                      style={{ width: "100px", height: "100px" }}
                    />
                  </div>
                ))}
              </div>
            </div>
            {otrosAlbumes.map((album, index) => (
              <div key={index} className="bg-zinc-800 max-w-md p-10 rounded-md">
                <h2 className="text-2xl font-bold mb-4">{album.nombre}</h2>
                <div className="flex gap-8" name="imagen">
                  {album.fotos.map((foto, idx) => (
                    <div key={idx}>
                      <h3 className="font-bold">{foto.nombre}</h3>
                      <img
                        src={foto.url}
                        alt={foto.descripcion}
                        style={{ width: "100px", height: "100px" }}
                      />
                      <button className="bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300" id={foto.url} onClick={() => verInformacion(foto)}>
                        Información
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </>
  );
}

export default VerPage;
