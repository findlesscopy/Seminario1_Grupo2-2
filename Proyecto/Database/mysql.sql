CREATE DATABASE semi;

USE semi;

CREATE TABLE niveles (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nivel INT UNIQUE,
    Nombre VARCHAR(50),
    Descripcion VARCHAR(255)
);

CREATE TABLE usuarios (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50),
    Apellido VARCHAR(50),
    CorreoElectronico VARCHAR(100) UNIQUE,
    Pass VARCHAR(255),
    FechaRegistro DATE,
    Peso FLOAT,
    Altura FLOAT,
    FotoPerfil VARCHAR(255),
    Nivel INT, -- Nivel de usuario
    Tipo VARCHAR(50), -- Tipo de usuario Admin, Usuario
    FOREIGN KEY (Nivel) REFERENCES niveles(Nivel)
);

CREATE TABLE clases (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50),
    Descripcion TEXT,
    Lugar VARCHAR(50),
    Profesor VARCHAR(50),
    Tipo VARCHAR(50),
    Fecha DATE,
    Hora TIME,
    Cupo INT,
    Estrellas INT -- Promedio de calificaciones
);

CREATE TABLE calificaciones (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDUsuario INT,
    IDClase INT,
    Calificacion INT,
    Fecha DATE,
    FOREIGN KEY (IDUsuario) REFERENCES usuarios(ID),
    FOREIGN KEY (IDClase) REFERENCES clases(ID),
    UNIQUE (IDUsuario, IDClase) -- No se puede calificar dos veces la misma clase
);

CREATE TABLE inscripciones (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDUsuario INT,
    IDClase INT,
    Fecha DATE,
    FOREIGN KEY (IDUsuario) REFERENCES usuarios(ID),
    FOREIGN KEY (IDClase) REFERENCES clases(ID)
);

CREATE TABLE rutinas (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nivel INT, -- Nivel de la rutina
    Nombre VARCHAR(50),
    Descripcion VARCHAR(255),
    FOREIGN KEY (Nivel) REFERENCES niveles(Nivel)
);


CREATE TABLE ejercicios (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDRutina INT, -- ID de la rutina a la que pertenece
    Nombre VARCHAR(50),
    Descripcion VARCHAR(255),
    Repeticiones INT,
    Series INT,
    Foto VARCHAR(255),
    Tipo VARCHAR(50), -- Pierna, Brazo, Pecho, Espalda, Abdomen
    FOREIGN KEY (IDRutina) REFERENCES rutinas(ID)
);

CREATE TABLE solicitudes (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDUsuario INT, -- ID del usuario que hace la solicitud
    NivelSolicitado INT, -- Nivel al que desea cambiar el usuario
    Estado VARCHAR(50), -- Estado de la solicitud (por ejemplo: pendiente, aprobada, rechazada)
    FechaSolicitud DATE,
    FOREIGN KEY (IDUsuario) REFERENCES usuarios(ID),
    FOREIGN KEY (NivelSolicitado) REFERENCES niveles(Nivel)
);
