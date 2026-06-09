# Generador de Cotizaciones House

## 1. Descripción del Proyecto
Aplicación web interna corporativa para asesores de ventas de electrodomésticos. Permite crear, gestionar y exportar cotizaciones de productos de línea blanca y electrodomésticos de forma rápida y profesional. Orientada a uso en sucursales físicas con múltiples asesores.

**Público objetivo:** Asesores de ventas en piso de sucursales de electrodomésticos.
**Valor central:** Agilizar el proceso de cotización, estandarizar la presentación al cliente y generar PDFs profesionales.

## 2. Estructura de Páginas
- `/login` — Pantalla de inicio de sesión para asesores y supervisores
- `/dashboard` — Panel principal del asesor con acceso a nueva cotización e historial
- `/cotizacion/nueva` — Formulario completo de nueva cotización con búsqueda de productos
- `/cotizacion/:id/preview` — Vista previa de cotización antes de generar PDF
- `/supervisor/dashboard` — Dashboard ejecutivo para supervisores con KPIs, tablas y vista trimestral

## 3. Funcionalidades Core
- [ ] Login de asesor con credenciales
- [ ] Dashboard con botón "Nueva cotización"
- [ ] Formulario de datos del cliente (fecha, nombre, teléfono, correo, ciudad, sucursal, asesor, fuente del lead)
- [ ] Buscador de productos por SKU, modelo o código
- [ ] Visualización de detalle de producto (descripción, marca, color, imagen)
- [ ] Tabla de productos agregados con SKU, descripción, cantidad, moneda, precio, subtotal
- [ ] Eliminación de productos de la tabla
- [ ] Resumen con subtotal, observaciones, vigencia
- [ ] Botón "Vista previa" para previsualizar cotización
- [ ] Botón "Generar PDF" para exportar cotización

## 4. Modelo de Datos
Por ahora se usará mock data local. Si más adelante se conecta Supabase:

### Tabla: advisors
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Identificador único |
| name | text | Nombre del asesor |
| email | text | Correo corporativo |
| password | text | Contraseña (hashed) |
| branch | text | Sucursal asignada |

### Tabla: products
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Identificador único |
| sku | text | Código SKU |
| model | text | Modelo del producto |
| brand | text | Marca |
| description | text | Descripción |
| color | text | Color |
| image | text | URL de imagen |
| price_usd | numeric | Precio en USD |
| price_mxn | numeric | Precio en MXN |

### Tabla: quotations
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Identificador único |
| advisor_id | uuid | FK a advisors |
| client_name | text | Nombre del cliente |
| client_phone | text | Teléfono |
| client_email | text | Correo |
| city | text | Ciudad |
| branch | text | Sucursal |
| lead_source | text | Fuente del lead |
| notes | text | Observaciones |
| validity_days | int | Días de vigencia |
| subtotal | numeric | Subtotal |
| created_at | timestamp | Fecha de creación |

## 5. Integraciones Planeadas
- **Supabase:** No requerido inicialmente. Podría añadirse después para persistencia de datos y login real.
- **Shopify:** No requerido — es herramienta interna, no tienda.
- **Stripe:** No requerido — es generador de cotizaciones, no procesador de pagos.

## 6. Plan de Desarrollo por Fases

### Fase 1: Login + Dashboard ✅ COMPLETADO
- Meta: Crear pantalla de login corporativa y dashboard principal
- Entregable: Login funcional con mock data, dashboard con diseño profesional y botón "Nueva cotización"

### Fase 2: Formulario de Cotización + Buscador de Productos ✅ COMPLETADO
- Meta: Crear el formulario completo con búsqueda de productos y tabla de productos agregados
- Entregable: Página de nueva cotización con todos los campos, buscador funcional, tabla interactiva, resumen lateral, vista previa modal y generación de PDF

### Fase 3: Dashboard Supervisor + Roles ✅ COMPLETADO
- Meta: Agregar rol supervisor con dashboard ejecutivo y modificar formulario de cotización con origen y asesor dinámico
- Entregable: Login con validación de contraseña, redirección por rol, formulario con campo origen y asesor responsable dinámico, dashboard supervisor completo con KPIs, filtros, rendimiento por sucursal y asesor, vista trimestral

### Fase 4: Historial y Navegación Completa
- Meta: Agregar historial de cotizaciones y pulir navegación
- Entregable: Dashboard con historial, flujo completo de navegación