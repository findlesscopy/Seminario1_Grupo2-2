from flask_cors import CORS

# El resto de tus importaciones
import os
import bcrypt
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
import boto3
import base64
from botocore.exceptions import NoCredentialsError
from dotenv import load_dotenv
import os

# Carga las variables de entorno desde el archivo .env
load_dotenv()

app = Flask(__name__)

# Habilita CORS para todas las rutas
CORS(app)

# Configuración de la base de datos
app.config['MYSQL_HOST'] = os.getenv('DB_HOST')
app.config['MYSQL_USER'] = os.getenv('DB_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('DB_DATABASE')

mysql = MySQL(app)

# Configuración de AWS
s3 = boto3.client('s3',
    aws_access_key_id=os.getenv('ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('SECRET_ACCESS_KEY')
)

nombresDeUsuario = set()

nombreBucket = 'practica1-g2-imagenes-b'

#Check
@app.route('/check')
def check():
    return jsonify({'messages':'Backend running'}), 200

@app.route('/usuarios_crear', methods=['POST'])
def crear_usuario():
    username = request.json['username']
    nombre = request.json['nombre']
    password = request.json['contraseña'].encode('utf-8')

    # Verifica si el nombre de usuario ya existe
    if username in nombresDeUsuario:
        return jsonify({'error': 'El nombre de usuario ya está en uso'}), 400

    # Genera un hash de la contraseña
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

    cur = mysql.connection.cursor()
    try:
        cur.execute('INSERT INTO Usuarios (username, nombre, contraseña) VALUES (%s, %s, %s)', (username, nombre, hashed_password))
        mysql.connection.commit()
    except Exception as e:
        return jsonify({'error': 'Error al crear usuario'}), 500

    # Si el nombre de usuario no existe, agrega el nombre de usuario al conjunto
    nombresDeUsuario.add(username)

    return jsonify({'message': 'Usuario creado exitosamente', 'id_usuario': cur.lastrowid}), 201


@app.route('/credenciales', methods=['POST'])
def iniciar_sesion():
    username = request.json['username']
    password = request.json['contraseña'].encode('utf-8')  # convertir la contraseña a bytes

    cur = mysql.connection.cursor()
    try:
        cur.execute('SELECT * FROM Usuarios WHERE username = %s', [username])
        result = cur.fetchone()
    except Exception as e:
        return jsonify({'error': 'Error al iniciar sesión'}), 500

    # Si no se encuentra el usuario
    if result is None:
        return jsonify({'error': 'Nombre de usuario o contraseña incorrectos'}), 401

    # Compara la contraseña proporcionada con la contraseña encriptada almacenada en la base de datos
    hashed_password = result[3].encode('utf-8')  # convertir la contraseña cifrada a bytes
    if bcrypt.checkpw(password, hashed_password):
        try:
            cur.execute('SELECT id_usuario FROM Usuarios WHERE username = %s', [username])
            result = cur.fetchone()
            if result is None:
                return jsonify({'error': 'Usuario no encontrado'}), 404
            id_usuario = result[0]
        except Exception as e:
            return jsonify({'error': 'Error al obtener usuario'}), 500

        return jsonify({'message': 'Inicio de sesión exitoso', 'id_usuario': id_usuario}), 200
    else:
        # Si las contraseñas no coinciden, el inicio de sesión falla
        return jsonify({'error': 'Nombre de usuario o contraseña incorrectos'}), 401

@app.route('/validar-contrasena', methods=['POST'])
def validar_contrasena():
    id_usuario = request.json['id_usuario']
    password = request.json['contraseña'].encode('utf-8')

    cur = mysql.connection.cursor()
    try:
        cur.execute('SELECT contraseña FROM Usuarios WHERE id_usuario = %s', [id_usuario])
        result = cur.fetchone()
    except Exception as e:
        return jsonify({'error': 'Error al obtener contraseña'}), 500

    # Si no se encuentra el usuario
    if result is None:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    # Compara la contraseña proporcionada con la contraseña encriptada almacenada en la base de datos
    hashed_password = result[0].encode('utf-8')  # convertir la contraseña cifrada a bytes
    if bcrypt.checkpw(password, hashed_password):
        return jsonify({'message': 'Contraseña válida'}), 200
    else:
        # Si las contraseñas no coinciden, la validación falla
        return jsonify({'error': 'Contraseña inválida'}), 401

@app.route('/fotos-perfil', methods=['POST'])
def subir_foto_perfil():
    nombre = request.json['nombre']
    imagen_base64 = request.json['imagenBase64']
    id_usuario = request.json['id_usuario']
    imagen_buffer = base64.b64decode(imagen_base64)

    cur = mysql.connection.cursor()
    try:
        cur.execute('SELECT COUNT(*) FROM fotos_perfil WHERE id_usuario = %s', [id_usuario])
        result = cur.fetchone()
        if result is None:
            return jsonify({'message': 'No hay fotos de perfil para este usuario'}), 200
        cantidad = result[0]
    except Exception as e:
        return jsonify({'error': 'Error al obtener fotos de perfil'}), 500

    nombre_foto_en_s3 = "Fotos_Perfil/" + nombre + str(cantidad)

    params = {
        'Bucket': nombreBucket,
        'Key': nombre_foto_en_s3,
        'Body': imagen_buffer,
        'ContentType': 'image/jpeg'
    }

    try:
        s3.put_object(**params)
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error al subir la foto a S3'}), 500

    url = f"https://{nombreBucket}.s3.amazonaws.com/{nombre_foto_en_s3}"

    try:
        cur.execute('INSERT INTO fotos (nombre, url_foto) VALUES (%s, %s)', [nombre, url])
        id_foto = cur.lastrowid
        cur.execute('UPDATE fotos_perfil SET estado = "inactivo" WHERE id_usuario = %s ', [id_usuario])
        cur.execute('INSERT INTO fotos_perfil (id_usuario, id_foto, estado) VALUES (%s, %s, "activo")', [id_usuario, id_foto])
        mysql.connection.commit()
    except Exception as e:
        return jsonify({'error': 'Error al agregar foto de perfil'}), 500

    return jsonify({'message': 'Foto de perfil agregada exitosamente'}), 201

@app.route('/obtener_usuarios', methods=['POST'])
def obtener_usuarios():
    # imprimir lo enviado
    username = request.json['username']
    id_usuario = request.json['id_usuario']

    cur = mysql.connection.cursor()
    try:
        cur.execute('SELECT * FROM Usuarios WHERE username = %s', [username])
        result = cur.fetchone()
        cur.execute('SELECT id_foto FROM fotos_perfil WHERE id_usuario = %s AND estado = "activo"', [id_usuario])
        id_foto = cur.fetchone()[0]
        cur.execute('SELECT url_foto FROM fotos WHERE id_foto = %s', [id_foto])
        url_foto = cur.fetchone()[0]
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error al obtener usuarios'}), 500

    return jsonify({'id_usuario': result[0], 'username': result[1], 'nombre': result[2], 'url_foto': url_foto}), 200

@app.route('/actualizar_datos', methods=['PUT'])
def actualizar_datos():
    print(request.json)
    id_usuario = request.json['id_usuario']
    nombre = request.json['nombre']
    username = request.json['username']

    cur = mysql.connection.cursor()
    try:
        cur.execute('UPDATE Usuarios SET nombre = %s, username = %s WHERE id_usuario = %s', [nombre, username, id_usuario])
        mysql.connection.commit()
    except Exception as e:
        return jsonify({'error': 'Error al actualizar datos'}), 500

    return jsonify({'message': 'Datos actualizados exitosamente'}), 200

@app.route('/crear_foto_albumes', methods=['POST'])
def crear_foto_albumes():
    nombre = request.json['nombre']
    id_usuario = request.json['id_usuario']
    imagenBase64 = request.json['imagenBase64']
    nombre_album = request.json['nombre_album']

    cursor = mysql.connection.cursor()

    try:
        cursor.execute("SELECT id_album FROM albumes WHERE nombre = %s AND id_usuario = %s", (nombre_album, id_usuario))
        result = cursor.fetchone()
        id_album = result[0]

        cursor.execute("SELECT COUNT(*) FROM fotos WHERE id_album = %s", [id_album])
        cantidad = cursor.fetchone()[0]


        imagenBuffer = base64.b64decode(imagenBase64)
        nombreFotoEnS3 = "Fotos_Publicadas/" + nombre + str(id_album) + str(cantidad) + ".jpg"

        params = {
            'Bucket': nombreBucket,
            'Key': nombreFotoEnS3,
            'Body': imagenBuffer,
            'ContentType': 'image/jpeg'
        }

        url = "https://practica1-g2-imagenes-b.s3.amazonaws.com/" + nombreFotoEnS3

        cursor.execute("INSERT INTO fotos (nombre, url_foto, id_album) VALUES (%s, %s, %s)", (nombre, url, id_album))
        mysql.connection.commit()

        s3.put_object(**params)
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error al crear álbum'}), 500

    return jsonify({'message': 'Foto creada exitosamente'}), 201

@app.route('/crear_album', methods=['POST'])
def crear_album():
    nombre_album = request.json['nombre']
    id_usuario = request.json['id_usuario']

    cur = mysql.connection.cursor()
    try:
        cur.execute('INSERT INTO albumes (nombre, id_usuario) VALUES (%s, %s)', [nombre_album, id_usuario])
        mysql.connection.commit()
    except Exception as e:
        return jsonify({'error': 'Error al crear album'}), 500

    return jsonify({'message': 'Album creado exitosamente'}), 201

@app.route('/modificar_album', methods=['PUT'])
def modificar_album():
    nombre_album = request.json['nombre']
    id_album = request.json['id_album']
    

    cur = mysql.connection.cursor()
    try:
        cur.execute('UPDATE albumes SET nombre = %s WHERE id_album = %s', [nombre_album, id_album])
        mysql.connection.commit()
    except Exception as e:
        return jsonify({'error': 'Error al modificar album'}), 500

    return jsonify({'message': 'Album modificado exitosamente'}), 200


@app.route('/eliminar_album', methods=['DELETE'])
def eliminar_album():
    id_album = request.json['id_usuario']
    nombre = request.json['nombre']

    cursor = mysql.connection.cursor()

    # Crear un cliente de S3
    s3 = boto3.client('s3')

    try:
        # Obtener el id del álbum
        cursor.execute("SELECT id_album FROM albumes WHERE nombre = %s AND id_usuario = %s", (nombre, id_album))
        result = cursor.fetchone()
        id_album = result[0]
        
        # Obtener las urls de las fotos del álbum
        cursor.execute("SELECT url_foto FROM fotos WHERE id_album = %s", [id_album])
        urls = cursor.fetchall()

        # Eliminar las fotos del bucket S3
        for url in urls:
            key = url[0].split('/')[-2] + '/' + url[0].split('/')[-1]
            s3.delete_object(Bucket=nombreBucket, Key=key)

        # Eliminar las fotos y el álbum de la base de datos
        cursor.execute("DELETE FROM fotos WHERE id_album = %s", [id_album])
        cursor.execute("DELETE FROM albumes WHERE id_album = %s", [id_album])

        mysql.connection.commit()
    except Exception as e:
        print(e)
        return jsonify({'error': 'Error al eliminar álbum'}), 500

    return jsonify({'message': 'Álbum eliminado exitosamente'}), 200

@app.route('/obtener_albumes', methods=['POST'])
def obtener_albumes():
    id_usuario = request.json['id_usuario']

    cursor = mysql.connection.cursor()

    try:
        cursor.execute("SELECT * FROM albumes WHERE id_usuario = %s", [id_usuario])
        results = cursor.fetchall()
    except Exception as e:
        return jsonify({'error': 'Error al obtener albumes'}), 500

    return jsonify(results), 200


@app.route('/obtener_fotos_perfil', methods=['POST'])
def obtener_fotos_perfil():
    id_usuario = request.json['id_usuario']

    cursor = mysql.connection.cursor()

    try:
        
        cursor.execute("SELECT fotos.url_foto FROM fotos_perfil INNER JOIN fotos ON fotos_perfil.id_foto = fotos.id_foto WHERE fotos_perfil.id_usuario = %s ", [id_usuario])
        results = cursor.fetchall()

    except Exception as e:
        return jsonify({'error': 'Error al obtener fotos de perfil'}), 500

    return jsonify(results), 200


@app.route('/obtener_fotos_album', methods=['POST'])
def obtener_fotos_album():
    id_album = request.json['id_album']

    cursor = mysql.connection.cursor()

    try:
        cursor.execute("SELECT * FROM fotos WHERE id_album = %s", [id_album])
        results = cursor.fetchall()
    except Exception as e:
        return jsonify({'error': 'Error al obtener fotos de album'}), 500

    return jsonify(results), 200

if __name__ == '__main__':
    app.run(port=3000, host='0.0.0.0')