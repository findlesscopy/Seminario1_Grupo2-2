import os
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from hashlib import sha256
import bcrypt
import pymysql.cursors

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configure AWS credentials
aws_region = os.getenv('REGION')
aws_access_key_id_rekognition = os.getenv('AWS_ACCESS_KEY_IDR')
aws_secret_access_key_rekognition = os.getenv('AWS_SECRET_ACCESS_KEYR')
aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID_S3')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY_S3')
aws_access_key_id_sns = os.getenv('AWS_ACCESS_KEY_ID_SNS')
aws_secret_access_key_sns = os.getenv('AWS_SECRET_ACCESS_KEY_SNS')

# Create AWS clients
rekognition = boto3.client('rekognition', region_name=aws_region, aws_access_key_id=aws_access_key_id_rekognition, aws_secret_access_key=aws_secret_access_key_rekognition)
s3_rekognition = boto3.client('s3', region_name=aws_region, aws_access_key_id=aws_access_key_id_rekognition, aws_secret_access_key=aws_secret_access_key_rekognition)
s3 = boto3.client('s3', region_name=aws_region, aws_access_key_id=aws_access_key_id, aws_secret_access_key=aws_secret_access_key)
sns = boto3.client('sns', region_name=aws_region, aws_access_key_id=aws_access_key_id_sns, aws_secret_access_key=aws_secret_access_key_sns)

# Configure MySQL connection
db_host = os.getenv('DB_HOST')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_database = os.getenv('DB_DATABASE')

# Create MySQL connection
connection = pymysql.connect(host=db_host,
                             user=db_user,
                             password=db_password,
                             database=db_database,
                             cursorclass=pymysql.cursors.DictCursor)

# Create Flask app
app = Flask(__name__)
CORS(app)

# Check endpoint
@app.route('/check', methods=['GET'])
def check():
    return jsonify({'message': 'Server is running'}), 200

# Register endpoint
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        nombre = data['nombre']
        apellido = data['apellido']
        correo = data['correo']
        contraseña = data['contraseña']
        peso = data['peso']
        altura = data['altura']
        foto = data['foto']
        nivel = data['nivel']

        # Hash password
        hashed_password = bcrypt.hashpw(contraseña.encode('utf-8'), bcrypt.gensalt())

        # Sign up user in Cognito
        # Implementation for Cognito sign up is missing as it requires AWS Cognito SDK for Python

        # Save image to S3
        image_data = foto.encode('utf-8')
        bucket_name = 'usuarios-fithub'
        object_key = f"Fotos_Perfil/{nombre}"
        s3.put_object(Body=image_data, Bucket=bucket_name, Key=object_key, ContentType='image/jpeg')

        # Get image URL from S3
        image_url = f"https://{bucket_name}.s3-{aws_region}.amazonaws.com/{object_key}"

        # Insert user into MySQL database
        with connection.cursor() as cursor:
            sql = "INSERT INTO usuarios (Nombre, Apellido, CorreoElectronico, Pass, FechaRegistro, Peso, Altura, FotoPerfil, Nivel) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(sql, (nombre, apellido, correo, hashed_password, datetime.now(), peso, altura, image_url, nivel))
            connection.commit()

        return jsonify({'message': 'Usuario creado exitosamente'}), 201

    except Exception as e:
        print('Error:', e)
        return jsonify({'mensaje': 'Error interno del servidor en usuarios crear'}), 500

@app.route('/credenciales', methods=['POST'])
def credenciales():
    try:
        data = request.json
        correo = data['correo']
        contraseña = data['contraseña']

        with connection.cursor() as cursor:
            sql = "SELECT * FROM usuarios WHERE CorreoElectronico = %s"
            cursor.execute(sql, (correo,))
            result = cursor.fetchone()

            if not result:
                return jsonify({'error': 'Nombre de usuario o contraseña incorrectos'}), 401

            hashed_password = result['Pass'].encode('utf-8')
            if bcrypt.checkpw(contraseña.encode('utf-8'), hashed_password):
                sql = "SELECT ID FROM usuarios WHERE CorreoElectronico = %s"
                cursor.execute(sql, (correo,))
                user_id = cursor.fetchone()['ID']

                params = {
                    'UserPoolId': region_cognito,
                    'Username': correo
                }
                response = cognitoISP.admin_get_user(**params)
                verification_status = response['UserAttributes'][1]['Value']

                if verification_status == 'false':
                    return jsonify({'error': 'Usuario no verificado'}), 401
                else:
                    return jsonify({'message': 'Inicio de sesión exitoso', 'id_usuario': user_id}), 200
            else:
                return jsonify({'error': 'Nombre de usuario o contraseña incorrectos'}), 401

    except Exception as e:
        print('Error:', e)
        return jsonify({'mensaje': 'Error interno del servidor en credenciales'}), 500

@app.route('/reconocimiento_facial', methods=['POST'])
async def reconocimiento_facial():
    try:
        data = request.json
        imagen = data['imagen']
        correo = data['correo']

        with connection.cursor() as cursor:
            sql = "SELECT ID, FotoPerfil FROM usuarios WHERE CorreoElectronico = %s"
            cursor.execute(sql, (correo,))
            result = cursor.fetchone()

            if not result:
                return jsonify({'mensaje': 'No se encontró el usuario'}), 404
            
            id_usuario = result['ID']
            foto_perfil = result['FotoPerfil']

            if foto_perfil:
                clave_foto = foto_perfil.split('/')[-2] + '/' + foto_perfil.split('/')[-1]

                s3_params = {
                    'Bucket': nombreBucket,
                    'Key': clave_foto
                }

                try:
                    s3_response = s3Rekognition.get_object(**s3_params)
                    foto_perfil_buffer = s3_response['Body'].read()

                    params = {
                        'SourceImage': {
                            'Bytes': foto_perfil_buffer
                        },
                        'TargetImage': {
                            'Bytes': bytearray.fromhex(imagen)
                        },
                        'SimilarityThreshold': 10
                    }

                    response = rekognitionUser.compare_faces(**params)
                    similarity = response['FaceMatches'][0]['Similarity'] if response['FaceMatches'] else 0
                    es_la_misma_persona = similarity > 90

                    params1 = {
                        'UserPoolId': region_cognito,
                        'Username': correo
                    }

                    response1 = cognitoISP.admin_get_user(**params1)
                    verificacion = response1['UserAttributes'][1]['Value']

                    if verificacion == 'false':
                        return jsonify({'error': 'Usuario no verificado'}), 401
                    else:
                        return jsonify({'Comparacion': similarity, 'EsLaMismaPersona': es_la_misma_persona, 'id_usuario': id_usuario}), 200

                except Exception as e:
                    print('Error:', e)
                    return jsonify({'mensaje': 'Error interno del servidor al obtener la foto de perfil de S3'}), 500

            else:
                return jsonify({'mensaje': 'La URL de la foto de perfil del usuario es nula o indefinida'}), 404

    except Exception as e:
        print('Error:', e)
        return jsonify({'mensaje': 'Error interno del servidor en comparar fotos'}), 500



# Función para crear un topic
def create_topic(topic_name):
    sns = boto3.client('sns')
    try:
        response = sns.create_topic(Name=topic_name)
        return response['TopicArn']
    except Exception as e:
        print('Error al crear el topic:', e)
        raise e

# Endpoint para suscribir un email
@app.route('/suscribir_email', methods=['POST'])
def suscribir_email():
    try:
        data = request.json
        nombre = data['nombre']
        email = data['email']

        topic_arn = create_topic(nombre)
        sns = boto3.client('sns')
        response = sns.subscribe(
            TopicArn=topic_arn,
            Protocol='email',
            Endpoint=email
        )

        return jsonify({'data': response}), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Endpoint para suscribir un teléfono
@app.route('/suscribir_telefono', methods=['POST'])
def suscribir_telefono():
    try:
        data = request.json
        nombre = data['nombre']
        telefono = data['telefono']

        topic_arn = create_topic(nombre)
        sns = boto3.client('sns')
        response = sns.subscribe(
            TopicArn=topic_arn,
            Protocol='sms',
            Endpoint=telefono
        )

        return jsonify({'data': response}), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Endpoint para publicar un mensaje
@app.route('/publicar_mensaje', methods=['POST'])
def publicar_mensaje():
    try:
        data = request.json
        mensaje = data['mensaje']
        topic_name = data['topicName']

        topic_arn = create_topic(topic_name)
        sns = boto3.client('sns')
        response = sns.publish(
            Message=mensaje,
            TopicArn=topic_arn
        )

        return jsonify({'data': response}), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Endpoint para eliminar una suscripción
@app.route('/eliminar_suscripcion', methods=['POST'])
def eliminar_suscripcion():
    try:
        data = request.json
        correo = data['correo']
        topic_name = data['topicName']

        topic_arn = create_topic(topic_name)
        sns = boto3.client('sns')
        response = sns.list_subscriptions_by_topic(
            TopicArn=topic_arn
        )

        subscriptions = response['Subscriptions']
        subscription = next((sub for sub in subscriptions if sub['Endpoint'] == correo), None)

        if subscription:
            response = sns.unsubscribe(
                SubscriptionArn=subscription['SubscriptionArn']
            )
            return jsonify({'data': response}), 200
        else:
            return jsonify({'mensaje': 'No se encontró la suscripción'}), 404

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Endpoint para eliminar un topic
@app.route('/eliminar_topic', methods=['POST'])
def eliminar_topic():
    try:
        data = request.json
        topic_name = data['topicName']

        topic_arn = create_topic(topic_name)
        sns = boto3.client('sns')
        response = sns.delete_topic(
            TopicArn=topic_arn
        )

        return jsonify({'data': response}), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Asignar nivel a usuario
@app.route('/asignarNivel', methods=['POST'])
def asignar_nivel():
    try:
        data = request.json
        id_usuario = data['idUsuario']
        nivel = data['nivel']

        query = 'UPDATE usuarios SET Nivel = %s WHERE ID = %s'
        with connection.cursor() as cursor:
            cursor.execute(query, (nivel, id_usuario))
            connection.commit()

        return jsonify({'message': 'Nivel asignado con éxito'}), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Enviar clases
@app.route('/clases', methods=['GET'])
def obtener_clases():
    try:
        query = 'SELECT * FROM clases'
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchall()

        return jsonify(result), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Enviar toda la información de clase por id
@app.route('/clases/<int:id>', methods=['GET'])
def obtener_clase_por_id(id):
    try:
        query = 'SELECT * FROM clases WHERE ID = %s'
        with connection.cursor() as cursor:
            cursor.execute(query, (id,))
            result = cursor.fetchone()

        return jsonify(result), 200 if result else 404

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Rutinas del nivel del usuario
@app.route('/rutinas/<int:id_usuario>', methods=['GET'])
def obtener_rutinas(id_usuario):
    try:
        query = 'SELECT * FROM rutinas WHERE Nivel = (SELECT Nivel FROM usuarios WHERE ID = %s)'
        with connection.cursor() as cursor:
            cursor.execute(query, (id_usuario,))
            result = cursor.fetchall()

        return jsonify(result), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Rutinas del nivel del usuario con sus ejercicios
@app.route('/rutinas_ejercicios/<int:id_usuario>', methods=['GET'])
def obtener_rutinas_con_ejercicios(id_usuario):
    try:
        query_rutinas = 'SELECT * FROM rutinas WHERE Nivel = (SELECT Nivel FROM usuarios WHERE ID = %s)'
        with connection.cursor() as cursor:
            cursor.execute(query_rutinas, (id_usuario,))
            rutinas = cursor.fetchall()

        for rutina in rutinas:
            query_ejercicios = 'SELECT * FROM ejercicios WHERE IDRutina = %s'
            with connection.cursor() as cursor:
                cursor.execute(query_ejercicios, (rutina['ID'],))
                ejercicios = cursor.fetchall()
            rutina['ejercicios'] = ejercicios

        return jsonify(rutinas), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Ejercicios de la rutina por id
@app.route('/ejercicios/<int:id_rutina>', methods=['GET'])
def obtener_ejercicios(id_rutina):
    try:
        query = 'SELECT * FROM ejercicios WHERE IDRutina = %s'
        with connection.cursor() as cursor:
            cursor.execute(query, (id_rutina,))
            result = cursor.fetchall()

        return jsonify(result), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Ejercicio por ID
@app.route('/ejercicio/<int:id>', methods=['GET'])
def obtener_ejercicio_por_id(id):
    try:
        query = 'SELECT * FROM ejercicios WHERE ID = %s'
        with connection.cursor() as cursor:
            cursor.execute(query, (id,))
            result = cursor.fetchall()

        return jsonify(result), 200 if result else 404

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Enviar todas las solicitudes con información detallada del usuario
@app.route('/solicitudes', methods=['GET'])
def obtener_solicitudes():
    try:
        query = '''
            SELECT 
                solicitudes.ID, 
                usuarios.CorreoElectronico AS CorreoUsuario, 
                usuarios.Nombre AS NombreUsuario, 
                solicitudes.NivelSolicitado, 
                solicitudes.Estado, 
                solicitudes.FechaSolicitud
            FROM solicitudes
            INNER JOIN usuarios ON solicitudes.IDUsuario = usuarios.ID
        '''
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchall()

        return jsonify(result), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Solicitar subir de nivel
@app.route('/solicitar_subir_nivel', methods=['POST'])
def solicitar_subir_nivel():
    try:
        data = request.json
        id_usuario = data['id_usuario']

        query_nivel_actual = 'SELECT Nivel FROM usuarios WHERE ID = %s'
        with connection.cursor() as cursor:
            cursor.execute(query_nivel_actual, (id_usuario,))
            result = cursor.fetchone()

        nivel_actual = result['Nivel']
        nivel_solicitado = nivel_actual + 1

        query_solicitud = 'INSERT INTO solicitudes (IDUsuario, NivelSolicitado, Estado, FechaSolicitud) VALUES (%s, %s, "Pendiente", NOW())'
        with connection.cursor() as cursor:
            cursor.execute(query_solicitud, (id_usuario, nivel_solicitado))
            connection.commit()

        return jsonify({'message': 'Solicitud enviada con éxito'}), 201

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Obtener datos de usuario por id
@app.route('/usuario/<int:id>', methods=['GET'])
def obtener_usuario_por_id(id):
    try:
        query = 'SELECT * FROM usuarios WHERE ID = %s'
        with connection.cursor() as cursor:
            cursor.execute(query, (id,))
            result = cursor.fetchall()

        return jsonify(result), 200 if result else 404

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Editar usuario
@app.route('/usuarios/<int:id>', methods=['PUT'])
def editar_usuario(id):
    try:
        data = request.json
        nombre = data['nombre']
        apellido = data['apellido']
        correo = data['correo']
        peso = data['peso']
        altura = data['altura']
        nivel = data['nivel']

        query = 'UPDATE usuarios SET Nombre = %s, Apellido = %s, CorreoElectronico = %s, Peso = %s, Altura = %s, Nivel = %s WHERE ID = %s'
        with connection.cursor() as cursor:
            cursor.execute(query, (nombre, apellido, correo, peso, altura, nivel, id))
            connection.commit()

        return jsonify({'message': 'Usuario editado con éxito'}), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Aceptar solicitud por id de solicitud
@app.route('/aceptar_solicitud/<int:id>', methods=['PUT'])
def aceptar_solicitud(id):
    try:
        query = 'UPDATE solicitudes SET Estado = "Aceptada" WHERE ID = %s'
        with connection.cursor() as cursor:
            cursor.execute(query, (id,))
            connection.commit()

        return jsonify({'message': 'Solicitud aceptada con éxito'}), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Rechazar solicitud por id de solicitud
@app.route('/rechazar_solicitud/<int:id>', methods=['PUT'])
def rechazar_solicitud(id):
    try:
        query = 'UPDATE solicitudes SET Estado = "Rechazada" WHERE ID = %s'
        with connection.cursor() as cursor:
            cursor.execute(query, (id,))
            connection.commit()

        return jsonify({'message': 'Solicitud rechazada con éxito'}), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

from datetime import date

# Obtener todos los Usuarios
@app.route('/usuarios/all', methods=['GET'])
def obtener_todos_los_usuarios():
    try:
        query = 'SELECT * FROM usuarios'
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchall()

        return jsonify(result), 200 if result else 404

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Obtener todos los niveles
@app.route('/niveles', methods=['GET'])
def obtener_todos_los_niveles():
    try:
        query = 'SELECT * FROM niveles'
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchall()

        return jsonify(result), 200 if result else 404

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

# Calificar clase
@app.route('/calificar_clase', methods=['POST'])
def calificar_clase():
    try:
        data = request.json
        IDUsuario = data['IDUsuario']
        IDClase = data['IDClase']
        Calificacion = data['Calificacion']
        Comentario = data.get('Comentario', None)

        query_insert_calificacion = 'INSERT INTO calificaciones (IDUsuario, IDClase, Calificacion, Comentario, Fecha) VALUES (%s, %s, %s, %s, %s)'
        with connection.cursor() as cursor:
            cursor.execute(query_insert_calificacion, (IDUsuario, IDClase, Calificacion, Comentario, date.today()))
            connection.commit()

        query_promedio = 'SELECT AVG(Calificacion) as Promedio FROM calificaciones WHERE IDClase = %s'
        with connection.cursor() as cursor:
            cursor.execute(query_promedio, (IDClase,))
            promedio_result = cursor.fetchone()
            promedio = promedio_result['Promedio']

        query_update_clase = 'UPDATE clases SET Estrellas = %s WHERE ID = %s'
        with connection.cursor() as cursor:
            cursor.execute(query_update_clase, (promedio, IDClase))
            connection.commit()

        return jsonify({'message': 'Clase calificada y promedio actualizado con éxito'}), 200

    except Exception as e:
        print('Error:', e)
        return jsonify({'error': str(e)}), 500

async def obtener_clases(profesor):
    try:
        query = 'SELECT * FROM clases WHERE profesor = %s'
        with connection.cursor() as cursor:
            cursor.execute(query, (profesor,))
            result = cursor.fetchall()

        return result

    except Exception as e:
        print('Error:', e)
        return None

@app.route('/obtener_mensaje_bot', methods=['POST'])
def obtener_mensaje_bot():
    try:
        message = request.json['message']
        sessionId = request.json['sessionId']

        lexClient = boto3.client('lex-runtime', 
                                 aws_access_key_id=bot_access_key, 
                                 aws_secret_access_key=bot_secret_access_key, 
                                 region_name=region)

        params = {
            'botId': bot_id,
            'botAliasId': bot_alias_id,
            'localeId': 'es_419',
            'sessionId': sessionId,
            'text': message
        }

        response = lexClient.post_text(**params)

        content = ""

        if 'messages' not in response:
            content = "No se ha podido obtener una respuesta del bot."
        else:
            content = response['messages'][0]['content']

        newSessionId = response['sessionId']
        sessionState = response.get('sessionState', {}).get('dialogAction', {}).get('type', '')
        intentName = response.get('sessionState', {}).get('intent', {}).get('name', '')
        print('intentName:', intentName)
        if sessionState == 'Close':
            print('Intent:', intentName)
            if intentName == 'listarClases':
                nombreProfesor = content.lower()
                clases = obtener_clases(nombreProfesor)
                if len(clases) > 0:
                    content = "Las clases del profesor " + nombreProfesor + " son: " + ", ".join([c['nombre'] for c in clases])
                else:
                    content = "Lo siento, no tengo información sobre las clases de ese profesor."
            elif intentName == 'clasesPorEstrellas':
                estrellas = content
                query = 'SELECT * FROM clases WHERE Estrellas = %s'
                cursor.execute(query, (estrellas,))
                result = cursor.fetchall()
                return jsonify(result), 200
            elif intentName == 'clasesPorTipo':
                tipo = content
                query = 'SELECT * FROM clases WHERE Tipo = %s'
                cursor.execute(query, (tipo,))
                result = cursor.fetchall()
                return jsonify(result), 200

        return jsonify({'mensaje': content, 'nueva_sesion': newSessionId, 'estado_session': sessionState}), 200
    except Exception as e:
        print('Error:', e)
        return jsonify({'mensaje': 'Error interno del servidor en obtener mensaje del bot'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='3000')
