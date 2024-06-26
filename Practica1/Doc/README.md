# PRACTICA 1 - GRUPO 2

## Integrantes

| Nombre | Carnet |
| --- | --- |
| José Manuel Ibarra Pirir | 202001800 |
| Roberto Carlos Gómez Donis | 202000544 |
| Angel Francisco Sique Santos | 202012039 |
----

## Descripción de la arquitectura

![Arquitectura](Images/arquitectura.png)

## Resumen de la arquitectura

**Componentes:**

* **Base de datos:** RDS (relacional o no relacional)
* **Servidores:** 2 servidores web (NodeJS y Python) en instancias EC2
* **Balanceador de carga:** AWS Load Balancing
* **Página web:** Alojada en un bucket S3 público
* **Almacenamiento de imágenes:** Bucket S3 con 2 carpetas (Fotos_Perfil y Fotos_Publicadas)

**Funcionamiento:**

1. La página web recibe una solicitud del usuario.
2. El balanceador de carga redirige la solicitud a uno de los servidores web.
3. El servidor web procesa la solicitud y consulta la base de datos.
4. El servidor web envía una respuesta al usuario.
5. Las imágenes se almacenan en el bucket S3 y se pueden acceder mediante una URL pública.

**Ventajas de esta arquitectura:**

* Alta disponibilidad: el balanceador de carga distribuye el tráfico entre los dos servidores web.
* Escalabilidad: se pueden agregar más servidores web si es necesario.
* Seguridad: la contraseña del usuario se encripta y los grupos de seguridad se configuran para proteger las instancias EC2.
* Facilidad de uso: AWS proporciona herramientas para administrar todos los componentes de la arquitectura.

**Limitaciones de esta arquitectura:**

* Costo: AWS puede ser costoso, especialmente si se necesita una gran cantidad de recursos.
* Complejidad: la configuración y administración de la arquitectura puede ser compleja.

## Usuarios IAM

### RDS

Este grupo de acceso a un usuario para poder configurar la base de datos.

![Grupo RDS](Images/grupords.png)
![Usuario RDS](Images/rds-usuario.png)

### EC2

Este se uso para crear las instancias y el balanceador de cargas

![Grupo EC2](Images/grupo-ec2.jpg)
![Usuario EC2](Images/usuario-ec2.jpg)

### S3 Página

Este usuario se uso para subir la página al S3

![Grupo S3 Página](Images/grupos3-pagina.jpg)
![Usuario S3 Página](Images/usuarios3-pagina.jpg)

### S3 Imagenes

Este grupo y usuario se uso para crear el bucket para almacenar las imagenes

![Grupo S3 Imágenes](Images/grupos3-imagenes.png)
![Usuario S3 Imágenes](Images/s3imagenes-usuario.png)

## Capturas de pantalla

### Página

![Bucket pagina](Images/bucket-pagina.jpg)

### EC2 (Python y Node)

#### Python

![EC2 Python](Images/ec2-python.jpg)

#### Node

![EC2 Node](Images/ec2-node.jpg)

### Imágenes

![Bucket imagenes](Images/bucket-imagenes.png)
