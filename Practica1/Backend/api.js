const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql');
const AWS = require('aws-sdk');
const cors = require('cors'); // Importa el paquete CORS
const fs = require('fs');
const bcrypt = require('bcrypt');
const nombresDeUsuario = new Set();

dotenv.config();
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;
const acceskeyid = process.env.ACCESS_KEY_ID;
const secretaccesskey = process.env.SECRET_ACCESS_KEY;

// Create a connection pool to the RDS MySQL database
const pool = mysql.createPool({
    host: host,
    user: user,
    password: password,
    database: database,
});

AWS.config.update({
    accessKeyId: acceskeyid,
    secretAccessKey: secretaccesskey,
});

const s3 = new AWS.S3();
const nombreBucket = 'practica1-g2-imagenes-b';

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Implementar CORS
app.use(cors());

//Check
app.get('/check', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});


// Agregar un nuevo usuario
app.post('/usuarios_crear', (req, res) => {
    const { username, nombre, contraseña } = req.body;
    
    // Verifica si el nombre de usuario ya existe
    if (nombresDeUsuario.has(username)) {
        // Si el nombre de usuario ya existe, devuelve un mensaje de error
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Genera un hash de la contraseña
    bcrypt.hash(contraseña, 10, (err, hash) => {
        if (err) {
            console.error('Error al encriptar la contraseña:', err);
            res.status(500).json({ error: 'Error al crear usuario' });
            return;
        }
        // Inserta el usuario en la base de datos con la contraseña encriptada
        pool.query('INSERT INTO Usuarios (username, nombre, contraseña) VALUES (?, ?, ?)', [username, nombre, hash], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Error al crear usuario1' });
                return;
            }
            // Si el nombre de usuario no existe, agrega el nombre de usuario al conjunto
            nombresDeUsuario.add(username);
            res.status(201).json({ message: 'Usuario creado exitosamente', id_usuario: results.insertId });
        });
    });
});

//inicio de sesion
app.post('/credenciales', (req, res) => {
    const { username, contraseña } = req.body;
    
    // Busca el usuario en la base de datos por su nombre de usuario
    pool.query('SELECT * FROM Usuarios WHERE username = ?', [username], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al iniciar sesión' });
            return;
        }
        
        // Si no se encuentra el usuario
        if (results.length === 0) {
            res.status(401).json({ error: 'Nombre de usuario o contraseña incorrectos' });
            return;
        }

        // Compara la contraseña proporcionada con la contraseña encriptada almacenada en la base de datos
        bcrypt.compare(contraseña, results[0].contraseña, (err, resultado) => {
            if (err) {
                //console.error('Error al comparar contraseñas:', err);
                res.status(500).json({ error: 'Error al iniciar sesión' });
                return;
            }
            if (resultado) {
                // Si las contraseñas coinciden, el inicio de sesión es exitoso
                pool.query('SELECT id_usuario FROM Usuarios WHERE username = ?', [username], (error, results, fields) => {
                    if (error) {
                        console.error(error);
                        res.status(500).json({ error: 'Error al obtener usuario' });
                        return;
                    }
                    res.status(200).json({ message: 'Inicio de sesión exitoso',id_usuario: results[0].id_usuario });
                });
            } else {
                // Si las contraseñas no coinciden, el inicio de sesión falla
                res.status(401).json({ error: 'Nombre de usuario o contraseña incorrectos' });
            }
        });
    });
});

// Validar contraseña
app.post('/validar-contrasena', (req, res) => {
    const { id_usuario, contraseña } = req.body;
    pool.query('SELECT contraseña FROM Usuarios WHERE id_usuario = ?', [id_usuario], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener contraseña' });
            return;
        }
        bcrypt.compare(contraseña, results[0].contraseña, (err, resultado) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                res.status(500).json({ error: 'Error al validar contraseña' });
                return;
            }
            if (resultado) {
                res.status(200).json({ message: 'Contraseña válida' });
            } else {
                res.status(401).json({ error: 'Contraseña inválida' });
            }
        }
        );
    });
});

//Subir foto de perfil por usuario nuevo
app.post('/fotos-perfil', (req, res) => {  
    const { nombre, imagenBase64, id_usuario } = req.body;
    const imagenBuffer = Buffer.from(imagenBase64, 'base64');

    // Realiza la consulta para contar el número de fotos de perfil del usuario
    pool.query('SELECT COUNT(*) FROM fotos_perfil WHERE id_usuario = ?', [id_usuario], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener fotos de perfil' });
            return;
        }
        const cantidad = results[0]['COUNT(*)'];

        // Nombre que deseas darle a la foto en S3
        const nombreFotoEnS3 = "Fotos_Perfil/" + nombre + cantidad;

        const params = {
            Bucket: nombreBucket,
            Key: nombreFotoEnS3,
            Body: imagenBuffer,
            ContentType: 'image/jpeg' // Tipo de contenido de la imagen
        };

        // Sube la foto a S3
        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error al subir la foto a S3:', err);
                res.status(500).json({ error: 'Error al subir la foto a S3' });
                return;
            }

            console.log('Foto subida correctamente a S3:', data.Location);

            // URL de la foto en S3
            const url = data.Location;

            // Inserta la información de la foto en la base de datos
            pool.query('INSERT INTO fotos (nombre, url_foto) VALUES (?, ?)', [nombre, url], (error, results1, fields) => {
                if (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Error al agregar foto de perfil' });
                    return;
                }
                
                // Inserta la relación entre el usuario y la foto de perfil
                pool.query('UPDATE fotos_perfil SET estado = "inactivo" WHERE id_usuario = ?', [id_usuario], (error, results2, fields) => {
                    if (error) {
                        console.error(error);
                        res.status(500).json({ error: 'Error al agregar foto de perfil' });
                        return;
                    }
                    
                    // Desactiva todas las fotos de perfil anteriores del usuario
                    pool.query('INSERT INTO fotos_perfil (id_usuario, id_foto, estado) VALUES (?, ?, "activo")', [id_usuario, results1.insertId], (error, results3, fields) => {
                        if (error) {
                            console.error(error);
                            res.status(500).json({ error: 'Error al actualizar estado de fotos de perfil' });
                            return;
                        }

                        console.log('Foto de perfil agregada exitosamente');
                        res.status(201).json({ message: 'Foto de perfil agregada exitosamente' });
                    });
                });
            });
        });
    });
});

//Obtener datos del usuario y foto de perfil
app.post('/obtener_usuarios', (req, res) => {
    const { username, id_usuario } = req.body;
    pool.query('SELECT * FROM Usuarios WHERE username = ?',[username], (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
        return;
      }
      pool.query('SELECT id_foto FROM fotos_perfil WHERE id_usuario = ? AND estado = "activo"', [id_usuario], (error, results1, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener fotos de perfil' });
            return;
        }
        pool.query('SELECT url_foto FROM fotos WHERE id_foto = ?', [results1[0].id_foto], (error, results2, fields) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Error al obtener fotos' });
                return;
            }
            res.status(200).json({id_usuario: results[0].id_usuario, nombre: results[0].nombre, username: results[0].username, url_foto: results2[0].url_foto});
        });
      });
    });
});

//Actualizar datos del usuario
app.put('/actualizar_datos', (req, res) => {
    const { id_usuario,nombre, username } = req.body;
    pool.query('UPDATE Usuarios SET nombre = ?, username = ? WHERE id_usuario = ?', [nombre, username,id_usuario], (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos' });
        return;
      }
      res.status(200).json({ message: 'Datos actualizados exitosamente' });
    });
  });

// Crear foto en album
app.post('/crear_foto_albumes', (req, res) => {
    const { nombre, id_usuario, imagenBase64, nombre_album } = req.body;
    // Insertar el álbum en la base de datos
    pool.query('SELECT id_album FROM albumes WHERE nombre = ? AND id_usuario = ?', [nombre_album, id_usuario], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear álbum' });
            return;
        }

        // Verificar si se encontró el álbum
        if (results.length === 0) {
            res.status(404).json({ error: 'El álbum no existe para el usuario proporcionado' });
            return;
        }
        
        // Obtener el ID del álbum
        const id_album = results[0].id_album;
        var cantidad = 0;
        pool.query('SELECT COUNT(*) FROM fotos WHERE id_album = ?', [results[0].id_album], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Error al obtener fotos de album' });
                return;
            }
            cantidad = results[0]['COUNT(*)'];

        });

        // Convertir la imagen base64 a un buffer
        const imagenBuffer = Buffer.from(imagenBase64, 'base64');

        // Nombre de la foto en S3
        const nombreFotoEnS3 = "Fotos_Publicadas/" + nombre + id_album+cantidad;

        // Parámetros para subir la foto a S3
        const params = {
            Bucket: nombreBucket,
            Key: nombreFotoEnS3,
            Body: imagenBuffer,
            ContentType: 'image/jpeg' // Tipo de contenido de la imagen
        };

        // URL de la foto en S3
        const url = "https://practica1-g2-imagenes-b.s3.us-east-2.amazonaws.com/" + nombreFotoEnS3;

        // Insertar la foto en la base de datos
        pool.query('INSERT INTO fotos (nombre, url_foto, id_album) VALUES (?, ?, ?)', [nombre, url, id_album], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Error al agregar foto al álbum' });
                return;
            }

            // Subir la foto a S3
            s3.upload(params, (err, data) => {
                if (err) {
                    console.error('Error al subir la foto a S3:', err);
                    res.status(500).json({ error: 'Error al subir la foto a S3' });
                    return;
                }

                console.log('Foto subida correctamente a S3:', data.Location);
                res.status(201).json({ message: 'Foto agregada al álbum exitosamente' });
            });
        });
    });
});

//Crear album
app.post('/crear_album', (req, res) => {
    const { nombre, id_usuario } = req.body;
    pool.query('INSERT INTO albumes (nombre, id_usuario) VALUES (?, ?)', [nombre, id_usuario], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear album' });
            return;
        }
        res.status(201).json({ message: 'Album creado exitosamente' });
    });
});

//Modificar album
app.put('/modificar_album', (req, res) => {
    const { nombre, id_album } = req.body;
    pool.query('UPDATE albumes SET nombre = ? WHERE id_album = ?', [nombre, id_album], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al modificar album' });
            return;
        }
        res.status(200).json({ message: 'Album modificado exitosamente' });
    });
});

// Eliminar album y sus fotos
app.delete('/eliminar_album', (req, res) => {
    const { nombre, id_usuario } = req.body;
    
    // Consultar el ID del álbum
    pool.query('SELECT id_album FROM albumes WHERE nombre = ? AND id_usuario = ?', [nombre, id_usuario], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar álbum' });
            return;
        }

        // Verificar si se encontró el álbum
        if (results.length === 0) {
            res.status(404).json({ error: 'El álbum no existe para el usuario proporcionado' });
            return;
        }

        const id_album = results[0].id_album;

        // Obtener las URLs de las fotos del álbum
        pool.query('SELECT url_foto FROM fotos WHERE id_album = ?', [id_album], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).json({ error: 'Error al obtener fotos del álbum' });
                return;
            }

            // Eliminar cada foto del álbum del bucket de S3
            results.forEach(photo => {
                const url = photo.url_foto;
                const key = url.split('/').slice(-1)[0]; // Extraer el nombre del archivo de la URL 
                const params = {
                    Bucket: nombreBucket,
                    Key: "Fotos_Publicadas/"+key
                };

                // Eliminar la foto del bucket de S3
                s3.deleteObject(params, (err, data) => {
                    if (err) {
                        console.error('Error al eliminar foto de S3:', err);
                        res.status(500).json({ error: 'Error al eliminar fotos del álbum en S3' });
                        return;
                    }
                    console.log('Foto eliminada de S3:', url);
                });
            });

            // Eliminar las fotos del álbum de la base de datos
            pool.query('DELETE FROM fotos WHERE id_album = ?', [id_album], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Error al eliminar fotos del álbum' });
                    return;
                }

                // Eliminar el álbum de la base de datos
                pool.query('DELETE FROM albumes WHERE id_album = ?', [id_album], (error, results, fields) => {
                    if (error) {
                        console.error(error);
                        res.status(500).json({ error: 'Error al eliminar álbum' });
                        return;
                    }
                    res.status(200).json({ message: 'Álbum eliminado exitosamente' });
                });
            });
        });
    });
});

//Obtener albumes
app.post('/obtener_albumes', (req, res) => {
    const { id_usuario } = req.body;
    pool.query('SELECT * FROM albumes WHERE id_usuario = ?', [id_usuario], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener albumes' });
            return;
        }
        res.status(200).json(results);
    });
});

// Obtener fotos de perfil
app.post('/obtener_fotos_perfil', (req, res) => {
    const { id_usuario } = req.body;
    
    // Realizar una sola consulta para obtener las fotos de perfil inactivas del usuario
    pool.query('SELECT fotos.url_foto FROM fotos_perfil INNER JOIN fotos ON fotos_perfil.id_foto = fotos.id_foto WHERE fotos_perfil.id_usuario = ?', [id_usuario], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener fotos de perfil' });
            return;
        }
        
        // Devolver las fotos obtenidas
        res.status(200).json(results);
    });
});

//obtener fotos de album
app.post('/obtener_fotos_album', (req, res) => {
    const { id_album } = req.body;
    pool.query('SELECT * FROM fotos WHERE id_album = ?', [id_album], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener fotos de album' });
            return;
        }
        res.status(200).json(results);
    });
});

// escuchar puerto 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
  })