// src/scripts/fetch-magistrados.ts
import pkg from "papaparse";
import fs from "fs/promises";
import path from "path";

const DATASET_ID = "3c18d46e-729e-4973-8efd-f54cab18b7e3";
const CKAN_API_URL = `https://datos.jus.gob.ar/api/3/action/package_show?id=${DATASET_ID}`;

export async function getMagistrados() {
  console.log(
    "🔍 Buscando el CSV más reciente en el Portal de Datos Abiertos...",
  );

  // 1. Obtener metadata del dataset
  const datasetRes = await fetch(CKAN_API_URL);
  if (!datasetRes.ok)
    throw new Error(`Error al consultar CKAN: ${datasetRes.status}`);

  const dataset = await datasetRes.json();
  const resources = dataset.result.resources;

  // 2. Filtrar solo los CSV y ordenar por fecha de modificación (el más reciente primero)
  const csvResources = resources
    .filter((r) => r.format?.toUpperCase() === "CSV")
    .sort((a, b) => {
      const dateA = new Date(a.last_modified || a.created || 0);
      const dateB = new Date(b.last_modified || b.created || 0);
      return dateB.getTime() - dateA.getTime();
    });

  if (csvResources.length === 0) {
    throw new Error("No se encontró ningún archivo CSV en el dataset");
  }

  const latestResource = csvResources[0];
  const CSV_URL = latestResource.url;
  const lastUpdated = latestResource.last_modified || latestResource.created;

  console.log(`✅ CSV más reciente encontrado:`);
  console.log(`   📄 Nombre: ${latestResource.name}`);
  console.log(`   📅 Última actualización: ${lastUpdated}`);

  // 3. Descargar el CSV
  console.log("📥 Descargando CSV...");
  const response = await fetch(CSV_URL);
  if (!response.ok) throw new Error(`Error al descargar: ${response.status}`);

  const csvText = await response.text();

  // 4. Parsear
  const { data } = pkg.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    trim: true,
    dynamicTyping: true,
  });

  // 5. Mapear columnas reales
  const magistrados = data
    .map((row) => ({
      nombre: row.magistrado_nombre?.trim() || "",
      cargo: row.cargo_tipo || "",
      organo: row.organo_nombre || "",
      organo_tipo: row.organo_tipo || "",
      jurisdiccion: row.justicia_federal_o_nacional || "",
      provincia: row.organo_provincia || "",
      estado: row.cargo_cobertura || "Titular",
      genero: row.magistrado_genero || "",
      fecha_jura: row.cargo_fecha_jura || "",
      dni: row.magistrado_dni || "",
      concurso_en_tramite: row.concurso_en_tramite || "",
      norma_fecha: row.norma_fecha || "",
    }))
    .filter((row) => row.nombre && row.nombre.length > 3);

  console.log(`📊 Se procesaron ${magistrados.length} magistrados.`);

  // 6. Guardar archivos
  const dataDir = path.join(process.cwd(), "src/data");
  await fs.mkdir(dataDir, { recursive: true });

  const fullData = {
    magistrados,
    lastUpdated, // ← fecha y hora de actualización
    source: latestResource.name,
  };

  await fs.writeFile(
    path.join(dataDir, "magistrados.json"),
    JSON.stringify(fullData, null, 2),
    "utf-8",
  );

  // Metadata separado (útil para mostrar "Última actualización" en la web)
  await fs.writeFile(
    path.join(dataDir, "metadata.json"),
    JSON.stringify({ lastUpdated, source: latestResource.name }, null, 2),
    "utf-8",
  );

  console.log("💾 Archivos guardados en src/data/");

  return {
    magistrados,
    lastUpdated, // formato ISO: "2024-04-17T12:18:57.100422"
  };
}

await getMagistrados();
