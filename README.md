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
npx prisma db push

# 3. Cargar usuarios de prueba (opcional: también se crean automáticamente en el primer login si la BD está vacía)
npm run seed

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## Credenciales de Prueba

| Rol | Usuario | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador (`ADMIN`)** | `admin` | `admin123` | Acceso total (incluyendo módulo `/users` y gestión de roles). |
| **Operador (`OPERATOR`)** | `operador` | `operador123` | Acceso operativo a dashboard, inventario, producción, alimentación, salud y crecimiento. |
