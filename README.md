# Generador de Cotizaciones House

Aplicacion independiente para asesores de House Electrodomesticos. Permite iniciar sesion por rol, buscar productos en Supabase, crear cotizaciones, guardar detalle y solicitar generacion de PDF mediante webhook de n8n/PDF.co.

## Alcance

- Proyecto aislado: no modifica n8n ni Supabase del agente de ventas.
- Puerto sugerido: `3105`.
- Acceso temporal VPS: `http://IP-DE-LA-VPS:3105`.
- Supervisor demo: `house@gmail.com` / `12345`.
- Asesores demo: correos sembrados en el SQL con password `house2026`.

## Instalacion local

```bash
npm install
cp .env.example .env
npm run build
npm run start
```

## Variables

El frontend Vite necesita las variables `VITE_`. Se conservan tambien las variables solicitadas para documentacion y compatibilidad operativa.

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
N8N_WEBHOOK_GENERAR_PDF=
PDFCO_API_KEY=
APP_PORT=3105
APP_BASE_URL=http://IP-DE-LA-VPS:3105

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_N8N_WEBHOOK_GENERAR_PDF=
VITE_APP_BASE_URL=http://IP-DE-LA-VPS:3105
```

## Supabase

1. Crear un proyecto nuevo separado para `house-cotizador-demo`.
2. Abrir SQL Editor.
3. Ejecutar `supabase/house_cotizador_schema.sql`.
4. Ejecutar `supabase/products_from_price_lists.sql` para cargar el catalogo desde Excel.
5. Copiar `Project URL` y `anon public key` al `.env`.

Tablas incluidas:

- `users`
- `productos`
- `cotizaciones`
- `cotizacion_detalle`

El SQL no borra datos existentes y usa `create table if not exists` / `insert ... on conflict`.

El archivo `products_from_price_lists.sql` se genero desde:

- `Lista de Precios Mabe 2026 Ene.. Rev1.xlsx`
- `Lista Precios Monogram y Cafe 20260315 (1).xlsx`

Solo importa SKU/modelo, marca, descripcion y categoria. No importa precios ni costos; el asesor captura el precio manual en cada cotizacion.

## Flujo PDF con n8n

La pantalla `Nueva Cotizacion` hace lo siguiente al presionar `Generar PDF`:

1. Valida cliente, correo, asesor/origen y productos.
2. Inserta encabezado en `cotizaciones`.
3. Inserta productos en `cotizacion_detalle`.
4. Envia payload a `VITE_N8N_WEBHOOK_GENERAR_PDF`.
5. Si n8n responde con `pdf_url`, `pdfUrl` o `url`, actualiza `cotizaciones.pdf_url` y estatus `Enviada`.

Politica fija enviada al webhook:

> Cotizacion valida hasta agotar existencia. Envio incluido. Precios sujetos a cambio sin previo aviso. Los pagos deben tomarse en cuenta al tipo de cambio al dia.

## Payload esperado por n8n

```json
{
  "app_base_url": "http://IP-DE-LA-VPS:3105",
  "politica_pdf": "Cotizacion valida hasta agotar existencia...",
  "cotizacion": {},
  "detalle": []
}
```

Respuesta recomendada de n8n:

```json
{
  "pdf_url": "https://..."
}
```

## Deploy VPS Hostinger aislado

```bash
git clone URL_DEL_REPO
cd house-cotizador-demo
npm install
cp .env.example .env
nano .env
npm run build
pm2 start npm --name house-cotizador-demo -- start
pm2 save
```

No se modifica nginx ni dominios existentes. Si despues se autoriza un dominio/subdominio, crear un archivo nuevo de nginx separado y activarlo manualmente.

## GitHub

```bash
git init
git add .
git commit -m "Initial house cotizador demo"
git branch -M main
git remote add origin URL_DEL_REPO
git push -u origin main
```

No subir `.env`.
