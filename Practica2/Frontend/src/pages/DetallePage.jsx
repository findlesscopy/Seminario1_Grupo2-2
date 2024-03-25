import { NavBarSimple } from "../components/NavBar";
import React, { useState } from "react";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card } from "../components/ui/Card";

function ExtraerPage() {
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      <div>
        <NavBarSimple />
        <div className="grid grid-cols-5 p-4">
          <div className="col-span-5 grid grid-cols-3 gap-2">
            <h1 className="font-bold">Información:</h1>
            <Card>
                <Label htmlFor="image">Imagen de perfil:</Label>
                <Input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*" // Solo permite archivos de imagen
                />
                <Label htmlFor="image">Vista previa:</Label>
                <div className="flex items-center justify-center borde">
                    {previewImage && (
                    <img
                        src={previewImage}
                        alt="Preview"
                        style={{ maxWidth: "100px" }}
                    />
                    )}
                </div>
            </Card>
            <button className="col-span-3 bg-indigo-500 px-4 py-1 rounded-md my-2 disabled:bg-indigo-300" >Extraer Texto</button>
            <textarea className="col-span-3 bg-zinc-800" rows="8" cols="50" ></textarea>
            
          </div>
        </div>
      </div>
    </>
  );
}

export default ExtraerPage;
