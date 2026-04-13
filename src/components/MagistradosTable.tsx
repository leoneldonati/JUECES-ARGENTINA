import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";

import { navigate } from "astro:transitions/client";

type Magistrado = {
  nombre: string;
  cargo: string;
  organo: string;
  provincia?: string;
  jurisdiccion: string;
  estado?: string;
};

interface Props {
  magistrados: Magistrado[];
}

export default function MagistradosTable({ magistrados }: Props) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Magistrado>[]>(
    () => [
      {
        accessorKey: "dni",
        header: "DNI",
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "cargo",
        header: "Cargo",
      },
      {
        accessorKey: "organo",
        header: "Órgano / Juzgado",
      },
      {
        accessorKey: "provincia",
        header: "Provincia",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "jurisdiccion",
        header: "Jurisdicción",
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }) => {
          const estado = getValue() as string | undefined;
          let className =
            "inline-flex px-4 py-1.5 rounded-full text-xs font-medium";

          if (estado === "Titular") {
            className +=
              " bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
          } else if (estado?.includes("Subrogante")) {
            className += " bg-amber-100 text-amber-700 ring-1 ring-amber-200";
          } else {
            className += " bg-gray-100 text-gray-600";
          }

          return (
            <span className={className}>{estado || "Sin información"}</span>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: magistrados,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  return (
    <div className="space-y-6">
      {/* Buscador y selector de páginas */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por nombre, cargo, provincia..."
            className="w-full px-6 py-4 pl-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-base placeholder:text-gray-400"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600 whitespace-nowrap">
            Filas por página:
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
          >
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/80 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-8 py-5 text-left font-semibold text-gray-700"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-blue-50/60 transition-colors duration-150 cursor-pointer"
                  title={`Mira más sobre: ${row.getValue("nombre")}`}
                  onClick={() => navigate(`/magistrado/${row.getValue("dni")}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-8 py-5 text-gray-700">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <div className="text-gray-600">
          Mostrando{" "}
          <span className="font-medium text-gray-900">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
          </span>{" "}
          -{" "}
          <span className="font-medium text-gray-900">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}
          </span>{" "}
          de{" "}
          <span className="font-medium text-gray-900">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          magistrados
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            « Primera
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <div className="flex gap-1 px-4">
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
              .slice(
                Math.max(0, table.getState().pagination.pageIndex - 2),
                Math.min(
                  table.getPageCount(),
                  table.getState().pagination.pageIndex + 3,
                ),
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => table.setPageIndex(page - 1)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    table.getState().pagination.pageIndex === page - 1
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
          </div>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Última »
          </button>
        </div>
      </div>
    </div>
  );
}
