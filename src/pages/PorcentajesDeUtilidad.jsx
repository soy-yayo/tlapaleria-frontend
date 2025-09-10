import React, { useState, useEffect } from "react";
import API from "../services/api";
let rangosGlobal = [];

export function getRangos() {
  return rangosGlobal;
}

function calcularPrecioVenta(precioCompra, rangos) {
  const rango = rangos.find(
    (r) =>
      precioCompra >= r.min &&
      precioCompra <= (r.max === Infinity ? Number.MAX_SAFE_INTEGER : r.max)
  );
  if (!rango) return null;
  return +Math.floor((precioCompra * (1 + rango.porcentaje / 100))).toFixed(2);
}

export default function PorcentajesDeUtilidad() {
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState(null);
  const [rangos, setRangos] = useState([]);
  const [nuevoRango, setNuevoRango] = useState({
    min: "",
    max: "",
    porcentaje: "",
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    API.get("/rangos", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRangos(res.data))
      .catch(() => setRangos([]));
  }, []);

  useEffect(() => {
    rangosGlobal = [...rangos];
  }, [rangos]);

  const handleChange = (e) => {
    const value = e.target.value;
    setPrecioCompra(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setPrecioVenta(calcularPrecioVenta(num, rangos));
    } else {
      setPrecioVenta(null);
    }
  };

  const handleNuevoRangoChange = (e) => {
    const { name, value } = e.target;
    setNuevoRango((prev) => ({ ...prev, [name]: value }));
  };
  // Guardar (crear o editar)
  const handleGuardarRango = async (e) => {
    e.preventDefault();
    const min = parseFloat(nuevoRango.min);
    const max =
      nuevoRango.max === "Infinity" ? Infinity : parseFloat(nuevoRango.max);
    const porcentaje = parseFloat(nuevoRango.porcentaje);
    const token = localStorage.getItem("token");

    if (isNaN(min) || isNaN(porcentaje)) return;

    try {
      if (editando) {
        // Editar
        const res = await API.put(
          `/rangos/${editando}`,
          { min, max, porcentaje },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRangos(
          rangos.map((r) => (r.id === editando ? res.data : r))
        );
        setEditando(null);
      } else {
        // Crear
        const res = await API.post(
          "/rangos",
          { min, max, porcentaje },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRangos([...rangos, res.data]);
      }

      setNuevoRango({ min: "", max: "", porcentaje: "" });
    } catch (err) {
      console.error("Error al guardar rango:", err);
    }
  };

  // Cargar datos en el formulario para editar
  const handleEditar = (rango) => {
    setNuevoRango({
      min: rango.min,
      max: rango.max === Infinity ? "Infinity" : rango.max,
      porcentaje: rango.porcentaje,
    });
    setEditando(rango.id);
  };

  // Eliminar
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este rango?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/rangos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRangos(rangos.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error al eliminar rango:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">
        Calculadora de Precio de Venta
      </h2>

      <label className="block mb-4">
        <span className="text-sm font-medium">Precio de compra:</span>
        <input
          type="number"
          value={precioCompra}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="mt-1 block w-full border rounded px-3 py-2 text-sm focus:ring focus:ring-blue-200"
        />
      </label>

      {precioVenta !== null && (
        <div className="mb-6 text-green-700 font-medium">
          Precio de venta sugerido: ${precioVenta}
        </div>
      )}

      <h4 className="font-medium mb-2">
        {editando ? "Editar rango" : "Agregar nuevo rango"}:
      </h4>
      <form onSubmit={handleGuardarRango} className="flex flex-wrap gap-2 mb-6">
        <input
          type="number"
          name="min"
          placeholder="Mínimo"
          value={nuevoRango.min}
          onChange={handleNuevoRangoChange}
          step="0.01"
          required
          className="w-20 border rounded px-2 py-1 text-sm"
        />
        <input
          type="text"
          name="max"
          placeholder="Máximo (o Infinity)"
          value={nuevoRango.max}
          onChange={handleNuevoRangoChange}
          required
          className="w-28 border rounded px-2 py-1 text-sm"
        />
        <input
          type="number"
          name="porcentaje"
          placeholder="%"
          value={nuevoRango.porcentaje}
          onChange={handleNuevoRangoChange}
          step="0.01"
          required
          className="w-20 border rounded px-2 py-1 text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          {editando ? "Actualizar" : "Agregar"}
        </button>
        {editando && (
          <button
            type="button"
            onClick={() => {
              setNuevoRango({ min: "", max: "", porcentaje: "" });
              setEditando(null);
            }}
            className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
          >
            Cancelar
          </button>
        )}
      </form>

      <h4 className="font-medium mb-2">Rangos de utilidad:</h4>
      <ul className="space-y-1 text-sm">
        {rangos.map((r) => (
          <li
            key={r.id}
            className="flex justify-between items-center border-b py-1"
          >
            <span>
              {r.min} – {r.max === Infinity ? "∞" : r.max}:{" "}
              <span className="font-semibold">{r.porcentaje}%</span>
            </span>
            <span className="flex gap-2">
              <button
                onClick={() => handleEditar(r)}
                className="text-blue-600 hover:underline text-xs"
              >
                Editar
              </button>
              <button
                onClick={() => handleEliminar(r.id)}
                className="text-red-600 hover:underline text-xs"
              >
                Eliminar
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
