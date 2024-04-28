const dotenv = require("dotenv");
const BodyParser = require("body-parser");
const express = require("express");
const mysql = require("mysql");
const AWS = require("aws-sdk");
const AWSCOGNITO = require("aws-sdk");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const cors = require("cors"); // Importa el paquete CORS
const fs = require("fs");
const bcrypt = require("bcrypt");
const nombresDeUsuario = new Set();

dotenv.config();
const cliente_cognito = process.env.CLIENTE_COGNITO;
const region_cognito = process.env.REGION_COGNITO;
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;
const region = process.env.REGION;
const acceskeyid = process.env.AWS_ACCESS_KEY_ID_S3;
const secretaccesskey = process.env.AWS_SECRET_ACCESS_KEY_S3;
const acceskeyidRekognition = process.env.AWS_ACCESS_KEY_IDR;
const secretaccesskeyRekognition = process.env.AWS_SECRET_ACCESS_KEYR;
const acceskeyidSNS = process.env.AWS_ACCESS_KEY_ID_SNS;
const secretaccesskeySNS = process.env.AWS_SECRET_ACCESS_KEY_SNS;
const acceskeyidCognito = process.env.AWS_ACCESS_KEY_ID_COGNITO;
const secretaccesskeyCognito = process.env.AWS_SECRET_ACCESS_KEY_COGNITO;
const bot_access_key = process.env.BOT_ACCESS_KEY_ID;
const bot_secret_access_key = process.env.BOT_SECRET_ACCESS_KEY;
const bot_id = process.env.BOT_ID;
const bot_alias_id = process.env.BOT_ALIAS_ID;

// Create a connection pool to the RDS MySQL database
const pool = mysql.createPool({
  host: host,
  user: user,
  password: password,
  database: database,
});

// Crea un nuevo cliente de Rekognition con sus propias credenciales
const rekognitionUser = new AWS.Rekognition({
  region: region,
  accessKeyId: acceskeyidRekognition,
  secretAccessKey: secretaccesskeyRekognition,
});

const s3Rekognition = new AWS.S3({
  region: region,
  accessKeyId: acceskeyidRekognition,
  secretAccessKey: secretaccesskeyRekognition,
});

const s3 = new AWS.S3({
  region: region,
  accessKeyId: acceskeyid,
  secretAccessKey: secretaccesskey,
});

AWSCOGNITO.config.update({
  region: region,
  accessKeyId: acceskeyidCognito,
  secretAccessKey: secretaccesskeyCognito,
});

const cognitoISP = new AWSCOGNITO.CognitoIdentityServiceProvider();

const nombreBucket = "usuarios-fithub";

const sns = new AWS.SNS({
  region: region,
  accessKeyId: acceskeyidSNS,
  secretAccessKey: secretaccesskeySNS,
});

const poolData = {
  UserPoolId: region_cognito,
  ClientId: cliente_cognito,
};

const cognito = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Create an Express app
const app = express();

app.use(BodyParser.json({ limit: "50mb" }));
app.use(BodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Middleware to parse JSON bodies
app.use(express.json());

// Implementar CORS
app.use(cors());

//Check
app.get("/check", (req, res) => {
  res.status(200).json({ message: "Server is running Node" });
});

// Agregar un nuevo usuario
app.post("/register", (req, res) => {
  try {
    const { nombre, apellido, correo, contraseña, peso, altura, foto, nivel } =
      req.body;

    var attributeslist = [];
    var dataEmail = {
      Name: "email",
      Value: correo,
    };
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataEmail
    );
    attributeslist.push(attributeEmail);

    try {
      bcrypt.hash(contraseña, 10, (err, hash) => {
        if (err) {
          console.error("Error al encriptar la contraseña:", err);
          res.status(500).json({ error: "Error al crear usuario" });
          return;
        }
        cognito.signUp(
          correo,
          hash,
          attributeslist,
          null,
          async (err, data) => {
            if (err) {
              console.error("Error al crear el usuario en cognito:", err);
              res.status(500).json({ error: "Error al crear usuario" });
              return;
            }
          }
        );
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        mensaje: "Error interno del servidor en enviar confirmacion de correo",
      });
    }

    const imagenBuffer = Buffer.from(foto, "base64");

    // Crear un nuevo objeto de fecha con la fecha y hora actual
    var fechaHoy = new Date();

    // Obtener el día, mes y año de la fecha de hoy
    var dia = fechaHoy.getDate();
    var mes = fechaHoy.getMonth() + 1; // Los meses van de 0 a 11, por lo que sumamos 1
    var año = fechaHoy.getFullYear();

    // Obtener la hora y los minutos de la fecha de hoy
    var hora = fechaHoy.getHours();
    var minutos = fechaHoy.getMinutes();

    // Formatear la fecha y hora en el formato deseado (por ejemplo, dd/mm/aaaa hh:mm)
    const fechaHoraFormateada = año + "-" + mes + "-" + dia;

    const nombreFotoEnS3 = "Fotos_Perfil/" + nombre;

    const params = {
      Bucket: nombreBucket,
      Key: nombreFotoEnS3,
      Body: imagenBuffer,
      ContentType: "image/jpeg", // Tipo de contenido de la imagen
    };

    // Sube la foto a S3
    s3.upload(params, (err, data) => {
      if (err) {
        console.error("Error al subir la foto a S3:", err);
        res.status(500).json({ error: "Error al subir la foto a S3" });
        return;
      }

      console.log("Foto subida correctamente a S3:", data.Location);

      // URL de la foto en S3
      const url = data.Location;

      // Genera un hash de la contraseña
      bcrypt.hash(contraseña, 10, (err, hash) => {
        if (err) {
          console.error("Error al encriptar la contraseña:", err);
          res.status(500).json({ error: "Error al crear usuario" });
          return;
        }
        //console.log(nombre, apellido, correo, hash, fechaHoraFormateada, peso, altura,url)
        // Inserta el usuario en la base de datos con la contraseña encriptada
        pool.query(
          "INSERT INTO usuarios (Nombre, Apellido, CorreoElectronico, Pass, FechaRegistro, Peso, Altura, FotoPerfil, Nivel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            nombre,
            apellido,
            correo,
            hash,
            fechaHoraFormateada,
            peso,
            altura,
            url,
            nivel,
          ],
          (error, results, fields) => {
            if (error) {
              console.error(error);
              res.status(500).json({ error: "Error al crear usuario" });
              return;
            }
            // Si el nombre de usuario no existe, agrega el nombre de usuario al conjunto
            nombresDeUsuario.add(correo);
            res.status(201).json({
              message: "Usuario creado exitosamente",
              id_usuario: results.insertId,
            });
          }
        );
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor en usuarios crear" });
  }
});

app.post("/credenciales", (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Busca el usuario en la base de datos por su nombre de usuario
    pool.query(
      "SELECT * FROM usuarios WHERE CorreoElectronico = ?",
      [correo],
      (error, results, fields) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: "Error al iniciar sesión" });
          return;
        }

        // Si no se encuentra el usuario
        if (results.length === 0) {
          res
            .status(401)
            .json({ error: "Nombre de usuario o contraseña incorrectos" });
          return;
        }

        // Compara la contraseña proporcionada con la contraseña encriptada almacenada en la base de datos
        bcrypt.compare(contraseña, results[0].Pass, (err, resultado) => {
          if (err) {
            //console.error('Error al comparar contraseñas:', err);
            res.status(500).json({ error: "Error al iniciar sesión" });
            return;
          }
          if (resultado) {
            // Si las contraseñas coinciden, el inicio de sesión es exitoso
            pool.query(
              "SELECT ID FROM usuarios WHERE CorreoElectronico = ?",
              [correo],
              (error, results1, fields) => {
                if (error) {
                  console.error(error);
                  res.status(500).json({ error: "Error al obtener usuario" });
                  return;
                }

                const params = {
                  UserPoolId: region_cognito,
                  Username: correo,
                };

                cognitoISP.adminGetUser(params, function (err, data) {
                  if (err) {
                    console.error(
                      "Error al obtener las credenciales del usuario:",
                      err
                    );
                    res
                      .status(500)
                      .json({ error: "Error al obtener credenciales" });
                    return;
                  }
                  let verificacion = data.UserAttributes[1].Value;

                  if (verificacion === "false") {
                    res.status(401).json({ error: "Usuario no verificado" });
                  } else {
                    res.status(200).json({
                      message: "Inicio de sesión exitoso",
                      id_usuario: results1[0].ID,
                    });
                  }
                });
              }
            );
          } else {
            // Si las contraseñas no coinciden, el inicio de sesión falla
            res
              .status(401)
              .json({ error: "Nombre de usuario o contraseña incorrectos" });
          }
        });
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor en credenciales" });
  }
});

// Inicio de sesión por reconocimiento facial
app.post("/reconocimiento_facial", async (req, res) => {
  try {
    const { imagen, correo } = req.body;

    // Primero, obtén el id_usuario correspondiente al username
    pool.query(
      "SELECT ID FROM usuarios WHERE CorreoElectronico = ?",
      [correo],
      async (error, results, fields) => {
        if (error) {
          console.error("Error:", error);
          res
            .status(500)
            .json({ mensaje: "Error interno del servidor al buscar usuario" });
        } else {
          // Asegúrate de que se encontró un usuario
          if (results.length > 0) {
            const id_usuario = results[0].ID;

            // Ahora, realiza la consulta original con el id_usuario correcto
            pool.query(
              "SELECT FotoPerfil FROM usuarios WHERE ID = ?",
              [id_usuario],
              async (error, results, fields) => {
                if (error) {
                  console.error("Error:", error);
                  res.status(500).json({
                    mensaje:
                      "Error interno del servidor en buscar foto de perfil",
                  });
                } else {
                  if (results.length > 0) {
                    const fotoPerfil = results[0].FotoPerfil;

                    // Verifica que la URL de la foto de perfil no sea nula o indefinida
                    if (fotoPerfil) {
                      const claveFoto =
                        fotoPerfil.split("/").slice(-2)[0] +
                        "/" +
                        fotoPerfil.split("/").slice(-1)[0];
                      // Obtener la imagen de la foto de perfil desde AWS S3
                      const s3Params = {
                        Bucket: nombreBucket,
                        Key: claveFoto,
                      };
                      try {
                        const s3Response = await s3Rekognition
                          .getObject(s3Params)
                          .promise();
                        const fotoPerfilBuffer = s3Response.Body;

                        const params = {
                          SourceImage: {
                            Bytes: fotoPerfilBuffer,
                          },
                          TargetImage: {
                            Bytes: Buffer.from(imagen, "base64"),
                          },
                          SimilarityThreshold: 10,
                        };

                        const response = await rekognitionUser
                          .compareFaces(params)
                          .promise();
                        const similarity =
                          response.FaceMatches[0]?.Similarity || 0;
                        let esLaMismaPersona = false;
                        if (similarity > 90) {
                          esLaMismaPersona = true;
                        }

                        const params1 = {
                          UserPoolId: region_cognito,
                          Username: correo,
                        };

                        cognitoISP.adminGetUser(params1, function (err, data) {
                          if (err) {
                            console.error(
                              "Error al obtener las credenciales del usuario:",
                              err
                            );
                            return;
                          }
                          let verificacion = data.UserAttributes[1].Value;

                          if (verificacion === "false") {
                            res
                              .status(401)
                              .json({ error: "Usuario no verificado" });
                          } else {
                            res.status(200).json({
                              Comparacion: similarity,
                              EsLaMismaPersona: esLaMismaPersona,
                              id_usuario: id_usuario,
                            });
                            //res.status(200).json({ message: 'Inicio de sesión exitoso', id_usuario: results1[0].ID });
                          }
                        });
                      } catch (error) {
                        console.error(
                          "Error al obtener la foto de perfil de S3:",
                          error
                        );
                        res.status(500).json({
                          mensaje:
                            "Error interno del servidor al obtener la foto de perfil de S3",
                        });
                      }
                    } else {
                      res.status(404).json({
                        mensaje:
                          "La URL de la foto de perfil del usuario es nula o indefinida",
                      });
                    }
                  } else {
                    res.status(404).json({
                      mensaje: "No se encontró la foto de perfil del usuario",
                    });
                  }
                }
              }
            );
          } else {
            res.status(404).json({ mensaje: "No se encontró el usuario" });
          }
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor en comparar fotos" });
  }
});

// Crear topic
async function createTopic(topicName) {
  console.log("Creando topic:", topicName);
  const params = {
    // parsear a string

    Name: topicName.replace(" ", "_")
  };

  try {
    const response = await sns.createTopic(params).promise();
    return response.TopicArn;
  } catch (error) {
    console.error("Error al crear el topic:", error);
    throw error;
  }
}

// Suscribir un email
app.post("/suscribir_email", async (req, res) => {
  const { nombre, email } = req.body;
  try {
    const topicArn = await createTopic(nombre);
    sns.subscribe(
      {
        TopicArn: topicArn,
        Protocol: "email",
        Endpoint: email,
      },
      (err, data) => {
        if (err) res.status(500).json({ error: err });
        else res.status(200).json({ data });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Suscribir un teléfono
app.post("/suscribir_telefono", async (req, res) => {
  const { nombre, telefono } = req.body;
  try {
    const topicArn = await createTopic(nombre);
    sns.subscribe(
      {
        TopicArn: topicArn,
        Protocol: "sms",
        Endpoint: telefono,
      },
      (err, data) => {
        if (err) res.status(500).json({ error: err });
        else res.status(200).json({ data });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Publicar mensaje
app.post("/publicar_mensaje", async (req, res) => {
  const { mensaje, topicName } = req.body;
  try {
    const topicArn = await createTopic(topicName);
    sns.publish(
      {
        Message: mensaje,
        TopicArn: topicArn,
      },
      (err, data) => {
        if (err) res.status(500).json({ error: err });
        else res.status(200).json({ data });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Eliminar suscripción
app.post("/eliminar_suscripcion", async (req, res) => {
  const { correo, topicName } = req.body;
  try {
    const topicArn = await createTopic(topicName);
    sns.listSubscriptionsByTopic(
      {
        TopicArn: topicArn,
      },
      (err, data) => {
        if (err) res.status(500).json({ error: err });
        else {
          const subscriptions = data.Subscriptions;
          const subscription = subscriptions.find(
            (sub) => sub.Endpoint === correo
          );
          sns.unsubscribe(
            {
              SubscriptionArn: subscription.SubscriptionArn,
            },
            (err, data) => {
              if (err) res.status(500).json({ error: err });
              else res.status(200).json({ data });
            }
          );
        }
      }
    );
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Eliminar topic
app.post("/eliminar_topic", async (req, res) => {
  const { topicName } = req.body;
  try {
    const topicArn = await createTopic(topicName);
    sns.deleteTopic(
      {
        TopicArn: topicArn,
      },
      (err, data) => {
        if (err) res.status(500).json({ error: err });
        else res.status(200).json({ data });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

/// Asignar nivel a usuario
app.post("/asignarNivel", (req, res) => {
  const { idUsuario, nivel } = req.body;

  const query = "UPDATE usuarios SET Nivel = ? WHERE ID = ?";

  pool.query(query, [nivel, idUsuario], (err, result) => {
    if (err) {
      console.error("Error al asignar el nivel:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json({ message: "Nivel asignado con éxito" });
    }
  });
});

// Enviar clases
app.get("/clases", (req, res) => {
  const query = "SELECT * FROM clases";

  pool.query(query, (err, result) => {
    if (err) {
      console.error("Error al obtener las clases:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  });
});

// Enviar toda la informacion de clase por id
app.get("/clases/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM clases WHERE ID = ?";

  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al obtener la clase:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  });
});

// Rutinas del nivel del usuario
app.get("/rutinas/:id_usuario", (req, res) => {
  const id_usuario = req.params.id_usuario;
  const query =
    "SELECT * FROM rutinas WHERE Nivel = (SELECT Nivel FROM usuarios WHERE ID = ?)";

  pool.query(query, [id_usuario], (err, result) => {
    if (err) {
      console.error("Error al obtener las rutinas:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  });
});

// Rutinas del nivel del usuario con sus ejercicios
app.get("/rutinas_ejercicios/:id_usuario", (req, res) => {
  const id_usuario = req.params.id_usuario;
  const query =
    "SELECT * FROM rutinas WHERE Nivel = (SELECT Nivel FROM usuarios WHERE ID = ?)";

  pool.query(query, [id_usuario], (err, rutinas) => {
    if (err) {
      console.error("Error al obtener las rutinas:", err);
      res.status(500).json({ error: err });
    } else {
      Promise.all(
        rutinas.map((rutina) => {
          return new Promise((resolve, reject) => {
            const query = "SELECT * FROM ejercicios WHERE IDRutina = ?";
            pool.query(query, [rutina.ID], (err, ejercicios) => {
              if (err) {
                reject(err);
              } else {
                resolve({ ...rutina, ejercicios });
              }
            });
          });
        })
      )
        .then((rutinas) => res.status(200).json(rutinas))
        .catch((err) => {
          console.error("Error al obtener los ejercicios:", err);
          res.status(500).json({ error: err });
        });
    }
  });
});

// Ejercicios de la rutina por id
app.get("/ejercicios/:id_rutina", (req, res) => {
  const id_rutina = req.params.id_rutina;
  const query = "SELECT * FROM ejercicios WHERE ID_rutina = ?";

  pool.query(query, [id_rutina], (err, result) => {
    if (err) {
      console.error("Error al obtener los ejercicios:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  });
});

// Ejercicio por id
app.get("/ejercicio/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM ejercicios WHERE ID = ?";

  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al obtener el ejercicio:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  });
});

// Enviar todas las solicitudes con información detallada del usuario
app.get("/solicitudes", (req, res) => {
  const query = `
        SELECT 
            solicitudes.ID, 
            usuarios.CorreoElectronico AS CorreoUsuario, 
            usuarios.Nombre AS NombreUsuario, 
            solicitudes.NivelSolicitado, 
            solicitudes.Estado, 
            solicitudes.FechaSolicitud
        FROM solicitudes
        INNER JOIN usuarios ON solicitudes.IDUsuario = usuarios.ID
    `;

  pool.query(query, (err, result) => {
    if (err) {
      console.error("Error al obtener las solicitudes:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  });
});

// Solicitar subir de nivel
app.post("/solicitar_subir_nivel", (req, res) => {
  const { id_usuario } = req.body;

  const queryNivelActual = "SELECT Nivel FROM usuarios WHERE ID = ?";

  pool.query(queryNivelActual, [id_usuario], (err, result) => {
    if (err) {
      console.error("Error al obtener el nivel del usuario:", err);
      res.status(500).json({ error: err });
    } else {
      const nivelActual = result[0].Nivel;
      const nivelSolicitado = nivelActual + 1;

      const querySolicitud =
        'INSERT INTO solicitudes (IDUsuario, NivelSolicitado, Estado, FechaSolicitud) VALUES (?, ?, "Pendiente", NOW())';

      pool.query(
        querySolicitud,
        [id_usuario, nivelSolicitado],
        (err, result) => {
          if (err) {
            console.error("Error al solicitar subir de nivel:", err);
            res.status(500).json({ error: err });
          } else {
            res.status(201).json({ message: "Solicitud enviada con éxito" });
          }
        }
      );
    }
  });
});

// Obtener datos de usuario por id
app.get("/usuario/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM usuarios WHERE ID = ?";

  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al obtener el usuario:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  });
});

// Editar usuario
app.put("/usuarios/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, apellido, correo, peso, altura, nivel } = req.body;

  const query =
    "UPDATE usuarios SET Nombre = ?, Apellido = ?, CorreoElectronico = ?, Peso = ?, Altura = ?, Nivel = ? WHERE ID = ?";

  pool.query(
    query,
    [nombre, apellido, correo, peso, altura, nivel, id],
    (err, result) => {
      if (err) {
        console.error("Error al editar el usuario:", err);
        res.status(500).json({ error: err });
      } else {
        res.status(200).json({ message: "Usuario editado con éxito" });
      }
    }
  );
});

// Aceptar solicitud por id de solicitud
app.put("/aceptar_solicitud/:id", (req, res) => {
  const id = req.params.id;
  const query = 'UPDATE solicitudes SET Estado = "Aceptada" WHERE ID = ?';

  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al aceptar la solicitud:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json({ message: "Solicitud aceptada con éxito" });
    }
  });
});

// Rechazar solicitud por id de solicitud
app.put("/rechazar_solicitud/:id", (req, res) => {
  const id = req.params.id;
  const query = 'UPDATE solicitudes SET Estado = "Rechazada" WHERE ID = ?';

  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al rechazar la solicitud:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json({ message: "Solicitud rechazada con éxito" });
    }
  });
});

// Obtener todos los Usuarios
app.get("/usuarios/all", (req, res) => {
  const query = "SELECT * FROM usuarios";

  pool.query(query, (err, result) => {
    if (err) {
      console.error("Error al obtener los usuarios:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  });
});

// Obtnener todos los niveles
app.get("/niveles", (req, res) => {
  const query = "SELECT * FROM niveles";

  pool.query(query, (err, result) => {
    if (err) {
      console.error("Error al obtener los niveles:", err);
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  });
});

// Calificar clase
app.post("/calificar_clase", (req, res) => {
  const { IDUsuario, IDClase, Calificacion, Comentario } = req.body;

  const query =
    "INSERT INTO calificaciones (IDUsuario, IDClase, Calificacion, Fecha) VALUES (?, ?, ?, CURDATE())";

  pool.query(query, [IDUsuario, IDClase, Calificacion], (err, result) => {
    if (err) {
      console.error("Error al calificar la clase:", err);
      res.status(500).json({ error: err });
    } else {
      const queryPromedio =
        "SELECT AVG(Calificacion) as Promedio FROM calificaciones WHERE IDClase = ?";
      pool.query(queryPromedio, [IDClase], (err, result) => {
        if (err) {
          console.error(
            "Error al calcular el promedio de calificaciones:",
            err
          );
          res.status(500).json({ error: err });
        } else {
          const promedio = result[0].Promedio;
          const queryUpdate = "UPDATE clases SET Estrellas = ? WHERE ID = ?";
          pool.query(queryUpdate, [promedio, IDClase], (err, result) => {
            if (err) {
              console.error(
                "Error al actualizar el promedio de calificaciones en la clase:",
                err
              );
              res.status(500).json({ error: err });
            } else {
              res.status(200).json({
                message: "Clase calificada y promedio actualizado con éxito",
              });
            }
          });
        }
      });
    }
  });
});

async function obtenerClases(profesor) {
  console.log("Profesor:", profesor);
  const query = "SELECT * FROM clases WHERE profesor = ?";
  console.log("Profesor:", profesor);
  return new Promise((resolve, reject) => {
    pool.query(query, [profesor], (err, result) => {
      if (err) {
        console.error("Error al obtener las clases:", err);
        reject(null);
      } else {
        resolve(result);
      }
    });
  });
}

app.post("/obtener_mensaje_bot", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    const lexClient = new AWS.LexRuntimeV2({
      accessKeyId: bot_access_key,
      secretAccessKey: bot_secret_access_key,
      region: region,
    });

    const params = {
      botId: bot_id,
      botAliasId: bot_alias_id,
      localeId: "es_419",
      sessionId: sessionId,
      text: message,
    };

    const response = await lexClient.recognizeText(params).promise();

    let content = "";

    if (!response.messages) {
      content = "No se ha podido obtener una respuesta del bot.";
    } else {
      content = response.messages[0].content;
    }

    const newSessionId = response.sessionId;
    const sessionState = response.sessionState?.dialogAction?.type || "";
    const intentName = response["sessionState"]["intent"]["name"];
    console.log("intentName:", intentName);
    console.log("Sessionstate:", sessionState);
    console.log("Intent:", intentName);
    const query = "SELECT * FROM clases ORDER BY Tipo";
    pool.query(query, (err, result) => {
      if (err) {
        console.error("Error al obtener las clases:", err);
        res.status(500).json({ error: err });
        return;
      } else {
        const resultString = result
          .map((row) => {
            return `ID: ${row.ID}, Nombre: ${row.Nombre}, Descripción: ${row.Descripcion}, Lugar: ${row.Lugar}, Profesor: ${row.Profesor}, Tipo: ${row.Tipo}, Fecha: ${row.Fecha}, Hora: ${row.Hora}, Cupo: ${row.Cupo}, Estrellas: ${row.Estrellas}`;
          })
          .join("\n");

        //console.log("Content:", resultString);
        //console.log("Content:", result);
        res.status(200).json(resultString);
        return;
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor en obtener mensaje del bot",
    });
    return;
  }
});
const translate = new AWS.Translate();
app.post("/traducir", async (req, res) => {
  const { texto } = req.body;
  const params = {
    SourceLanguageCode: "auto",
    TargetLanguageCode: "en",
    Text: texto,
  };
  translate.translateText(params, (err, data) => {
    if (err) {
      console.error("Error:", err);
      res
        .status(500)
        .json({ mensaje: "Error interno del servidor al traducir" });
    } else {
      res.status(200).json({ traduccion: data.TranslatedText });
    }
  });
});

// escuchar puerto 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
