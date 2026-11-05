# BioLogic AI - Sistema de Gestión Zootécnica con IA

Sistema web fullstack desarrollado con **Next.js 16 (App Router)**, **Prisma ORM (PostgreSQL)**, **Tailwind CSS v4**, **Zod** y **Google Gemini AI (`@google/genai`)** para la gestión integral y optimización productiva de animales menores (cuyes, conejos, aves).

---

## Características Principales

- **Dashboard Zootécnico en Tiempo Real**: Cálculo de Población Activa, Morbilidad, Mortalidad, Nacimientos e **Índice de Conversión Alimenticia (ICA)**.
- **BioLogic IA (`@google/genai`)**: Análisis técnico automatizado con Gemini 2.5 Flash y respaldo determinista basado en reglas zootécnicas.
- **Módulos Operativos**:
  - **Inventario (`/animals`)**: Control de reproductores y engorde con alertas automáticas de aptitud para empadre (Hembras >= 800 g, Machos >= 900 g).
  - **Producción (`/production`)**: Registro de partos, pozas, nacidos vivos/muertos y peso promedio al nacer.
  - **Alimentación (`/feeding`)**: Control de raciones y consumo acumulado en kg.
  - **Salud Animal (`/health`)**: Historial clínico con cambio automático de estado a *En Tratamiento (`SICK`)* mediante transacciones.
  - **Crecimiento (`/growth`)**: Bitácora de pesajes sincronizada transaccionalmente con el peso actual del animal.
  - **Usuarios y Roles (`/users`)**: Control de acceso basado en roles (`ADMIN` y `OPERATOR`) protegido con JWT (`jose`) en cookies `HttpOnly` y `proxy.js` de Next.js 16.

---

## Requisitos y Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/biologic_ai"
JWT_SECRET="una_clave_secreta_segura_de_al_menos_32_caracteres"
GEMINI_API_KEY="tu_api_key_de_google_gemini_opcional"
```

---

## Instalación y Puesta en Marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Sincronizar el esquema con la base de datos PostgreSQL
npx prisma migrate deploy

# 3. Crear el administrador inicial desde una terminal privada
# Define ADMIN_USERNAME, ADMIN_EMAIL y ADMIN_PASSWORD (m?nimo 12 caracteres)
# como variables de entorno antes de ejecutar:
npm run seed

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## Seguridad y consistencia

El login nunca crea cuentas. El seed requiere credenciales definidas en el entorno y no modifica usuarios existentes. Cambia las contrase?as de cualquier cuenta de prueba creada anteriormente antes de publicar la app.

Los permisos se consultan en la base de datos en cada solicitud protegida. Los animales con historial se conservan: usa el estado Vendido o Fallecido en lugar de eliminarlos.

El peso inicial crea un pesaje. Cambiarlo desde inventario agrega una medici?n con la fecha actual. El ?ltimo pesaje no se puede eliminar ni mover a otro animal; se debe editar o registrar un reemplazo.

El ICA usa, para cada animal, alimento registrado despu?s del primer pesaje y hasta el ?ltimo (intervalo abierto al inicio y cerrado al final). Incluye p?rdidas de peso y devuelve null cuando no hay alimento o ganancia neta positiva. Es una estimaci?n de los intervalos medidos, no de todo el consumo hist?rico.

Dashboard e IA comparten m?tricas calculadas en el servidor. Las notificaciones muestran registros sanitarios reales.

Ejecuta `npm test`, `npm run lint` y `npm run build` para validar cambios. Las relaciones del esquema ahora restringen el borrado de historiales. Se incluyen migraciones versionadas; no se ejecutan cambios de base de datos autom?ticamente.

### Bases de datos existentes

Si ya creaste las tablas con `prisma db push`, no ejecutes la migraci?n inicial sobre ellas. Primero verifica que la estructura coincide con `202611050001_baseline` (incluidos ?ndices y claves for?neas). Tras revisar esa equivalencia y respaldar la base, registra esa migraci?n como aplicada y ejecuta la actualizaci?n:

```bash
npx prisma migrate resolve --applied 202611050001_baseline
npx prisma migrate deploy
```

Para bases vac?as basta con `npx prisma migrate deploy`. Si la estructura existente difiere del baseline, reconcilia esa diferencia antes de marcarlo como aplicado.

### Estado de validaci?n

Las correcciones incluyen ocho pruebas de regresi?n de permisos, pesos e ICA. El build de producci?n pasa y ESLint no reporta errores; conserva advertencias de efectos de React e im?genes.

La auditor?a posterior a las actualizaciones compatibles conserva tres avisos altos en la cadena `prisma -> @prisma/config -> deepmerge-ts` y ocho moderados en la cadena de herramientas de ESLint. Los tres avisos de Prisma tambi?n aparecen al excluir dependencias de desarrollo. Requieren una revisi?n de compatibilidad adicional; no se consideran resueltos. Se actualizaron Next.js, PostCSS, Zod y las dependencias transitivas con correcciones compatibles.

No se han aplicado migraciones ni ejecutado pruebas de integraci?n sobre una base de datos real en este entorno.
