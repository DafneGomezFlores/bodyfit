-- =========================================================
-- NODO GYM · Esquema de base de datos (MySQL 8)
-- 5 tablas: usuario, tarifa_dinamica, membresias, permiso, pase_diarios
-- =========================================================

CREATE DATABASE IF NOT EXISTS nodo_gym
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nodo_gym;

-- ---------------------------------------------------------
-- 1. usuario
-- ---------------------------------------------------------
CREATE TABLE usuario (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  ci               VARCHAR(20)  NOT NULL UNIQUE,
  nombre_completo  VARCHAR(150) NOT NULL,
  telefono         VARCHAR(20),
  creado_en        DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 2. tarifa_dinamica  (tarifas / promociones)
-- ---------------------------------------------------------
CREATE TABLE tarifa_dinamica (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre_tarifa  VARCHAR(100) NOT NULL,
  precio         DECIMAL(10,2) NOT NULL,
  dias_duracion  INT NOT NULL,
  tipo           VARCHAR(50) NOT NULL   -- ej: 'estandar', 'promocion', 'descuento'
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 3. membresias
-- ---------------------------------------------------------
CREATE TABLE membresias (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id     INT NOT NULL,
  promocion_id   INT NULL,
  monto_pagado   DECIMAL(10,2) NOT NULL,
  fecha_inicio   DATE NOT NULL,
  fecha_fin      DATE NOT NULL,
  estado         ENUM('activa', 'por_vencer', 'vencida') NOT NULL DEFAULT 'activa',
  CONSTRAINT fk_membresia_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_membresia_tarifa
    FOREIGN KEY (promocion_id) REFERENCES tarifa_dinamica(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_membresias_fecha_fin ON membresias(fecha_fin);

-- ---------------------------------------------------------
-- 4. permiso  (solicitudes de extension/pausa de membresia)
-- ---------------------------------------------------------
CREATE TABLE permiso (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  membresia_id      INT NOT NULL,
  dias_solicitados  INT NOT NULL,
  fecha_anterior    DATE NOT NULL,
  fecha_nueva       DATE NOT NULL,
  fecha_registro    DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_permiso_membresia
    FOREIGN KEY (membresia_id) REFERENCES membresias(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 5. pase_diarios  (visitas sin membresia)
-- ---------------------------------------------------------
CREATE TABLE pase_diarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre_visita   VARCHAR(150) NOT NULL,
  monto           DECIMAL(10,2) NOT NULL,
  fecha_registro  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Datos de ejemplo (opcional, para probar el backend)
-- ---------------------------------------------------------
INSERT INTO tarifa_dinamica (nombre_tarifa, precio, dias_duracion, tipo) VALUES
  ('Mensual regular', 150.00, 30, 'estandar'),
  ('Trimestral', 400.00, 90, 'promocion'),
  ('Estudiante', 110.00, 30, 'descuento');

INSERT INTO usuario (ci, nombre_completo, telefono) VALUES
  ('13122797', 'Alvaro Arias', '70011223'),
  ('12739993', 'Alejandro Suarez', '70022334');

INSERT INTO membresias (usuario_id, promocion_id, monto_pagado, fecha_inicio, fecha_fin, estado) VALUES
  (1, 1, 150.00, '2026-08-12', '2026-09-12', 'por_vencer'),
  (2, 1, 150.00, '2026-08-12', '2026-09-12', 'por_vencer');
