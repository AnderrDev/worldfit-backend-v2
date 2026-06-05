-- Se ejecuta automaticamente la primera vez que arranca el contenedor
-- (cuando el volumen pgdata esta vacio). Crea el esquema que usa el DataSource.
CREATE SCHEMA IF NOT EXISTS worldfit;
