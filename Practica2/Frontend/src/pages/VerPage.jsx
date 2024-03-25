import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { API_URL } from "./url";
import { NavBarSimple } from "../components/NavBar";

function VerPage() {
  const [nombresAlbumes, setNombresAlbumes] = useState([]);
  const [id_albumes, setIdAlbumes] = useState([]);
  const [fotosAlbum, setFotosAlbum] = useState([]);
  const [fotos_perfil, setFotosPerfil] = useState([]);

  useEffect(() => {
    const id_usuario = Cookies.get("id");

    // Consiguiendo todas las fotos de perfil del usuario
    fetch(`${API_URL}/obtener_fotos_perfil`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_usuario: parseInt(id_usuario) }),
    })
      .then((response) => response.json())
      .then((data) => {
        const tempSet = new Set();
        //verificar si ya existe la foto de perfil
        for (let i = 0; i < data.length; i++) {
          if (!tempSet.has(data[i].url)) {
            tempSet.add(data[i][0]);
          }
        }
        const uniqueFotos = Array.from(tempSet);
        console.log("Fotos de perfil:", uniqueFotos);
        setFotosPerfil(uniqueFotos);
      })
      .catch((error) =>
        console.error("Error al obtener datos de los albumes:", error)
      );
    
    // Obtener los nombres y IDs de los álbumes
    fetch(`${API_URL}/obtener_albumes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_usuario: parseInt(id_usuario) }),
    })
      .then((response) => response.json())
      .then((data) => {
        const nombres = [];
        const ids = [];
        for (let i = 0; i < data.length; i++) {
          if (!nombres.some((album) => album.name === data[i][1])) {
            nombres.push({ name: data[i][1], id: data[i][0] });
            ids.push(data[i][0]);
          }
        }
        setNombresAlbumes(nombres);
        setIdAlbumes(ids);
      })
      .catch((error) =>
        console.error("Error al obtener datos de los albumes:", error)
      );
  }, []);

  useEffect(() => {
    // Hacer una solicitud para cada álbum y obtener las fotos
    const fetchFotosAlbum = async () => {
      const fotosPorAlbum = [];
      for (let i = 0; i < id_albumes.length; i++) {
        try {
          const response = await fetch(`${API_URL}/obtener_fotos_album`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_album: id_albumes[i] }),
          });
          const data = await response.json();
          fotosPorAlbum.push(data);
        } catch (error) {
          console.error("Error al obtener fotos del álbum:", error);
        }
      }
      setFotosAlbum(fotosPorAlbum);
    };

    fetchFotosAlbum();

    console.log(fotosAlbum);
  }, [id_albumes]);

  return (
    <>
      <NavBarSimple />
      <div className="flex justify-center">
        <div className="grid grid-cols-5 p-4">
          <div className="col-span-5 grid grid-cols-3 gap-4">
            <h1 className="text-2xl font-bold">Albumes</h1>
            <div className="bg-zinc-800 col-span-5 max-w-md p-10 rounded-md">
              <h2 className="text-2xl font-bold mb-4">
                Album de fotos de Perfil
              </h2>
              <div className="flex gap-8">
                {fotos_perfil.map((foto, index) => (
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
            <div className="bg-zinc-800 max-w-md p-10 rounded-md col-span-5">
              {nombresAlbumes.map((album, index) => (
                <div key={index}>
                  <h2 className="text-2xl font-bold mb-4">{album.name}</h2>
                  <div className="flex gap-8" name="imagen">
                    {fotosAlbum[index] &&
                      fotosAlbum[index].map((foto, idx) => (
                        <div key={idx}>
                          <h3 className="font-bold">{foto[1]}</h3>
                          <img
                            key={idx}
                            src={foto[2]}
                            alt={`Foto ${idx + 1} del álbum ${album.name}`}
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
      </div>
    </>
  );
}

export default VerPage;
