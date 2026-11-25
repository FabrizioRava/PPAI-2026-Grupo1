-- CreateTable
CREATE TABLE "ComisionMedica" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,

    CONSTRAINT "ComisionMedica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "rolId" INTEGER NOT NULL,
    "asignadoAId" INTEGER NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombreUsuario" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "empleadoId" INTEGER NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoBolsin" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "EstadoBolsin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispositivoGPS" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,

    CONSTRAINT "DispositivoGPS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bolsin" (
    "id" SERIAL NOT NULL,
    "numeroBolsin" INTEGER NOT NULL,
    "numeroPrecinto" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "origenId" INTEGER NOT NULL,
    "destinoId" INTEGER NOT NULL,
    "dispositivoGPSId" INTEGER NOT NULL,

    CONSTRAINT "Bolsin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CambioDeEstadoBolsin" (
    "id" SERIAL NOT NULL,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3),
    "bolsinId" INTEGER NOT NULL,
    "estadoId" INTEGER NOT NULL,
    "responsableCEId" INTEGER NOT NULL,

    CONSTRAINT "CambioDeEstadoBolsin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComisionMedica_codigo_key" ON "ComisionMedica"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_nombreUsuario_key" ON "Usuario"("nombreUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_empleadoId_key" ON "Usuario"("empleadoId");

-- CreateIndex
CREATE UNIQUE INDEX "EstadoBolsin_nombre_key" ON "EstadoBolsin"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Bolsin_numeroBolsin_key" ON "Bolsin"("numeroBolsin");

-- CreateIndex
CREATE UNIQUE INDEX "Bolsin_dispositivoGPSId_key" ON "Bolsin"("dispositivoGPSId");

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "ComisionMedica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bolsin" ADD CONSTRAINT "Bolsin_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "ComisionMedica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bolsin" ADD CONSTRAINT "Bolsin_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "ComisionMedica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bolsin" ADD CONSTRAINT "Bolsin_dispositivoGPSId_fkey" FOREIGN KEY ("dispositivoGPSId") REFERENCES "DispositivoGPS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CambioDeEstadoBolsin" ADD CONSTRAINT "CambioDeEstadoBolsin_bolsinId_fkey" FOREIGN KEY ("bolsinId") REFERENCES "Bolsin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CambioDeEstadoBolsin" ADD CONSTRAINT "CambioDeEstadoBolsin_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "EstadoBolsin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CambioDeEstadoBolsin" ADD CONSTRAINT "CambioDeEstadoBolsin_responsableCEId_fkey" FOREIGN KEY ("responsableCEId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
