-- Insertar niveles
INSERT INTO niveles (Nivel, Nombre, Descripcion) VALUES
(1, 'Principiante', 'Rutinas y ejercicios para principiantes'),
(2, 'Intermedio', 'Rutinas y ejercicios para usuarios con cierta experiencia'),
(3, 'Avanzado', 'Rutinas y ejercicios para usuarios avanzados');

-- Insertar rutinas para el nivel 1
INSERT INTO rutinas (Nivel, Nombre, Descripcion) VALUES
(1, 'Rutina de Calentamiento', 'Rutina para calentar antes de comenzar el entrenamiento'),
(1, 'Rutina de Piernas', 'Rutina enfocada en ejercicios para fortalecer las piernas'),
(1, 'Rutina de Brazos', 'Rutina enfocada en ejercicios para fortalecer los brazos');

-- Insertar ejercicios para la rutina de calentamiento (nivel 1)
INSERT INTO ejercicios (IDRutina, Nombre, Descripcion, Repeticiones, Series, Tipo) VALUES
(1, 'Estiramientos de Cuello', 'Estiramientos suaves para el cuello', 10, 2, 'Estiramiento'),
(1, 'Rotación de Hombros', 'Rotación de hombros en sentido circular', 15, 2, 'Estiramiento'),
(1, 'Flexiones de Brazos', 'Flexiones de brazos con apoyo en el suelo', 8, 3, 'Fuerza');

-- Insertar ejercicios para la rutina de piernas (nivel 1)
INSERT INTO ejercicios (IDRutina, Nombre, Descripcion, Repeticiones, Series, Tipo) VALUES
(2, 'Sentadillas', 'Sentadillas con el peso del cuerpo', 12, 3, 'Fuerza'),
(2, 'Zancadas', 'Zancadas para trabajar los músculos de las piernas', 10, 3, 'Fuerza'),
(2, 'Elevación de Pantorrillas', 'Elevación de pantorrillas para fortalecer los músculos de la pantorrilla', 15, 3, 'Fuerza');

-- Insertar ejercicios para la rutina de brazos (nivel 1)
INSERT INTO ejercicios (IDRutina, Nombre, Descripcion, Repeticiones, Series, Tipo) VALUES
(3, 'Flexiones de Brazos', 'Flexiones de brazos con apoyo en el suelo', 10, 3, 'Fuerza'),
(3, 'Curl de Bíceps', 'Curl de bíceps con mancuernas', 12, 3, 'Fuerza'),
(3, 'Tríceps en Banco', 'Extensiones de tríceps en banco', 12, 3, 'Fuerza');

-- Insertar rutinas para el nivel 2
INSERT INTO rutinas (Nivel, Nombre, Descripcion) VALUES
(2, 'Rutina de Cardio', 'Rutina de ejercicios cardiovasculares para aumentar la resistencia'),
(2, 'Rutina de Espalda', 'Rutina enfocada en ejercicios para fortalecer la espalda'),
(2, 'Rutina de Abdominales', 'Rutina para fortalecer los músculos abdominales');

-- Insertar ejercicios para la rutina de cardio (nivel 2)
INSERT INTO ejercicios (IDRutina, Nombre, Descripcion, Repeticiones, Series, Tipo) VALUES
(4, 'Carrera en Cinta', 'Carrera en cinta de correr a ritmo moderado', 20, 1, 'Cardio'),
(4, 'Ciclismo Estacionario', 'Ciclismo estacionario en bicicleta estática', 30, 1, 'Cardio'),
(4, 'Saltos de Tijera', 'Saltos alternando las piernas como tijeras', 20, 1, 'Cardio');

-- Insertar ejercicios para la rutina de espalda (nivel 2)
INSERT INTO ejercicios (IDRutina, Nombre, Descripcion, Repeticiones, Series, Tipo) VALUES
(5, 'Dominadas', 'Dominadas en barra fija con agarre amplio', 8, 3, 'Fuerza'),
(5, 'Remo con Barra', 'Remo con barra para trabajar los músculos de la espalda', 10, 3, 'Fuerza'),
(5, 'Peso Muerto', 'Peso muerto para fortalecer la espalda baja y los glúteos', 10, 3, 'Fuerza');

-- Insertar ejercicios para la rutina de abdominales (nivel 2)
INSERT INTO ejercicios (IDRutina, Nombre, Descripcion, Repeticiones, Series, Tipo) VALUES
(6, 'Crunches', 'Crunches para trabajar los músculos abdominales superiores', 15, 3, 'Fuerza'),
(6, 'Plancha', 'Plancha para fortalecer los músculos abdominales y del core', 30, 3, 'Fuerza'),
(6, 'Elevación de Piernas', 'Elevación de piernas para trabajar los músculos abdominales inferiores', 12, 3, 'Fuerza');

-- Insertar rutinas para el nivel 3
INSERT INTO rutinas (Nivel, Nombre, Descripcion) VALUES
(3, 'Rutina de Fuerza Avanzada', 'Rutina avanzada de entrenamiento de fuerza'),
(3, 'Rutina de Flexibilidad', 'Rutina para mejorar la flexibilidad y la movilidad'),
(3, 'Rutina de Potencia', 'Rutina para desarrollar potencia muscular y explosividad');

-- Insertar ejercicios para la rutina de fuerza avanzada (nivel 3)
INSERT INTO ejercicios (IDRutina, Nombre, Descripcion, Repeticiones, Series, Tipo) VALUES
(7, 'Sentadillas con Salto', 'Sentadillas con salto para desarrollar fuerza explosiva', 10, 3, 'Fuerza'),
(7, 'Press de Banca', 'Press de banca con barra para trabajar el pecho y los tríceps', 8, 3, 'Fuerza'),
(7, 'Peso Muerto Rumano', 'Variación del peso muerto para enfocarse en los músculos posteriores de las piernas', 10, 3, 'Fuerza');

-- Insertar ejercicios para la rutina de flexibilidad (nivel 3)
INSERT INTO ejercicios (IDRutina, Nombre, Descripcion, Repeticiones, Series, Tipo) VALUES
(8, 'Estiramiento de Flexores de Cadera', 'Estiramiento de los músculos flexores de la cadera', 15, 3, 'Estiramiento'),
(8, 'Estiramiento de Isquiotibiales', 'Estiramiento de los músculos isquiotibiales', 15, 3, 'Estiramiento'),
(8, 'Estiramiento de Espalda', 'Estiramiento de los músculos de la espalda', 15, 3, 'Estiramiento');

-- Insertar ejercicios para la rutina de potencia (nivel 3)
INSERT INTO ejercicios (IDRutina, Nombre, Descripcion, Repeticiones, Series, Tipo) VALUES
(9, 'Arrancada Olímpica', 'Movimiento olímpico para desarrollar potencia y velocidad', 5, 5, 'Potencia'),
(9, 'Plancha con Palmada', 'Plancha con palmada para trabajar el core y mejorar la potencia', 10, 3, 'Potencia'),
(9, 'Salto en Cuclillas', 'Salto vertical desde posición de cuclillas para desarrollar potencia de piernas', 8, 3, 'Potencia');

-- Insertar más clases de Yoga
INSERT INTO clases (Nombre, Descripcion, Lugar, Profesor, Tipo, Fecha, Hora, Cupo)
VALUES
('Yoga Restaurativo', 'Clase de yoga suave enfocada en la relajación y la restauración del cuerpo', 'Centro de Yoga Vida', 'Elena Martínez', 'Yoga', '2024-04-24', '18:00:00', 15),
('Yoga Vinyasa', 'Clase de yoga dinámica que combina movimiento fluido con la respiración', 'Gimnasio Flex', 'David Sánchez', 'Yoga', '2024-04-25', '19:30:00', 20),
('Yoga Terapéutico', 'Clase de yoga diseñada para personas con lesiones o limitaciones físicas', 'Centro de Rehabilitación Física', 'Luisa Rodríguez', 'Yoga', '2024-04-26', '11:00:00', 10);

-- Insertar más clases de Pilates
INSERT INTO clases (Nombre, Descripcion, Lugar, Profesor, Tipo, Fecha, Hora, Cupo)
VALUES
('Pilates para Principiantes', 'Clase de pilates diseñada especialmente para principiantes', 'Gimnasio Pilates Fit', 'Carlos Gómez', 'Pilates', '2024-04-27', '10:00:00', 15),
('Pilates Avanzado', 'Clase de pilates con ejercicios más avanzados para usuarios con experiencia', 'Centro Pilates Elite', 'Laura Fernández', 'Pilates', '2024-04-28', '18:30:00', 10),
('Pilates en Grupo', 'Clase de pilates en grupo para disfrutar y compartir la experiencia', 'Gimnasio Pilates Center', 'Sara García', 'Pilates', '2024-04-29', '09:30:00', 20);

-- Insertar más clases de Entrenamiento Funcional
INSERT INTO clases (Nombre, Descripcion, Lugar, Profesor, Tipo, Fecha, Hora, Cupo)
VALUES
('HIIT', 'Clase de entrenamiento de alta intensidad (HIIT) para quemar calorías y mejorar la condición física', 'Gimnasio Power', 'Mario Martínez', 'Funcional', '2024-04-30', '17:30:00', 25),
('Cross Training', 'Clase de cross training que combina ejercicios de fuerza y resistencia', 'Gimnasio CrossFit Pro', 'Pedro López', 'Funcional', '2024-05-01', '18:00:00', 20),
('Entrenamiento en Circuito', 'Clase de entrenamiento en circuito para trabajar diferentes grupos musculares', 'Gimnasio Fit Zone', 'Natalia Ruiz', 'Funcional', '2024-05-02', '19:00:00', 20);