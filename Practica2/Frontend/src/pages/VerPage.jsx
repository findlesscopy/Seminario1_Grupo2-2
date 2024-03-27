import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { API_URL } from "./url";
import { NavBarSimple } from "../components/NavBar";

function VerPage() {
  const [fotosPerfil, setFotosPerfil] = useState([]);
  const [primerAlbum, setPrimerAlbum] = useState(null);
  const [otrosAlbumes, setOtrosAlbumes] = useState([]);

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
        const responsePrimerAlbum = await fetch(`${API_URL}/obtener_albumes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_usuario: parseInt(id_usuario) }),
        });
        const dataPrimerAlbum = await responsePrimerAlbum.json();
        if (dataPrimerAlbum.length > 0) {
          const primerAlbum = {
            nombre: dataPrimerAlbum[0].nombre,
            fotos: [],
          };
          // Obtener fotos del primer álbum
          const responseFotosPrimerAlbum = await fetch(
            `${API_URL}/obtener_fotos_album`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_album: dataPrimerAlbum[0].id_album }),
            }
          );
          const dataFotosPrimerAlbum = await responseFotosPrimerAlbum.json();
          primerAlbum.fotos = dataFotosPrimerAlbum.map((foto) => ({
            nombre: foto.nombre,
            url: foto.url_foto,
            descripcion: foto.descripcion,
          }));
          setPrimerAlbum(primerAlbum);
        }

        // Obtener otros álbumes
        if (dataPrimerAlbum.length > 1) {
          const otrosAlbumes = [];
          for (let i = 1; i < dataPrimerAlbum.length; i++) {
            const album = {
              nombre: dataPrimerAlbum[i].nombre,
              fotos: [],
            };
            // Obtener fotos de otros álbumes
            const responseFotosAlbum = await fetch(
              `${API_URL}/obtener_fotos_album`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_album: dataPrimerAlbum[i].id_album }),
              }
            );
            const dataFotosAlbum = await responseFotosAlbum.json();
            album.fotos = dataFotosAlbum.map((foto) => ({
              nombre: foto.nombre,
              url: foto.url_foto,
              descripcion: foto.descripcion,
            }));
            otrosAlbumes.push(album);
          }
          setOtrosAlbumes(otrosAlbumes);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    obtenerDatos();
  }, []);

  return (
    <>
      <div>
        <NavBarSimple />
        <div className="flex justify-center items-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Álbumes</h1>
        <div className="bg-zinc-800 max-w-md p-10 rounded-md">
          <h2 className="text-2xl font-bold mb-4">Álbum de fotos de Perfil</h2>
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
        {primerAlbum && (
          <div className="bg-zinc-800 max-w-md p-10 rounded-md">
            <h2 className="text-2xl font-bold mb-4">{primerAlbum.nombre}</h2>
            <div className="flex gap-8" name="imagen">
              {primerAlbum.fotos.map((foto, index) => (
                <div key={index}>
                  <h3 className="font-bold">{foto.nombre}</h3>
                  <img
                    src={foto.url}
                    alt={foto.descripcion}
                    style={{ width: "100px", height: "100px" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
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
