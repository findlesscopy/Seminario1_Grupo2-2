CREATE DATABASE IF NOT EXISTS semi;
USE semi;
-- Tabla Usuarios
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    nombre VARCHAR(100),
    contraseña VARCHAR(255)
);

-- Tabla Albumes
CREATE TABLE Albumes (
    id_album INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- Tabla Fotos
CREATE TABLE Fotos (
    id_foto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    url_foto VARCHAR(255),
    id_album INT,
    descripcion VARCHAR(255),
    FOREIGN KEY (id_album) REFERENCES Albumes(id_album)
);

-- Tabla Fotos_perfil
CREATE TABLE Fotos_perfil (
    id_foto_perfil INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_foto INT,
    estado ENUM('activo', 'inactivo') DEFAULT 'inactivo',
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_foto) REFERENCES Fotos(id_foto)
);

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1234';