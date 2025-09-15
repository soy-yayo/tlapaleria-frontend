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
        const res = await API.put(
          `/rangos/${editando}`,
          { min, max, porcentaje },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRangos(rangos.map((r) => (r.id === editando ? res.data : r)));
        setEditando(null);
      } else {
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

  const handleEditar = (rango) => {
    setNuevoRango({
      min: rango.min,
      max: rango.max === Infinity ? "Infinity" : rango.max,
      porcentaje: rango.porcentaje,
    });
    setEditando(rango.id);
  };

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
    <div className="max-w-lg mx-auto mt-10 bg-white border rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">📊 Calculadora de Utilidad</h2>

      {/* Precio compra */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Precio de compra
        </label>
        <input
          type="number"
          value={precioCompra}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Resultado */}
      {precioVenta !== null && (
        <div className="mb-6 text-green-700 font-medium">
          Precio de venta sugerido:{" "}
          <span className="font-bold">${precioVenta}</span>
        </div>
      )}

      {/* Formulario de rangos */}
      <h3 className="font-semibold mb-2">
        {editando ? "✏️ Editar rango" : "➕ Agregar rango"}
      </h3>
      <form
        onSubmit={handleGuardarRango}
        className="flex flex-wrap items-center gap-2 mb-6"
      >
        <input
          type="number"
          name="min"
          placeholder="Mín"
          value={nuevoRango.min}
          onChange={handleNuevoRangoChange}
          step="0.01"
          required
          className="w-24 rounded-xl border border-slate-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="text"
          name="max"
          placeholder="Máx o ∞"
          value={nuevoRango.max}
          onChange={handleNuevoRangoChange}
          required
          className="w-28 rounded-xl border border-slate-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="number"
          name="porcentaje"
          placeholder="%"
          value={nuevoRango.porcentaje}
          onChange={handleNuevoRangoChange}
          step="0.01"
          required
          className="w-20 rounded-xl border border-slate-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
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
            className="px-3 py-1.5 rounded-xl bg-slate-400 text-white text-sm hover:bg-slate-500 transition"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista de rangos */}
      <h3 className="font-semibold mb-2">📈 Rangos de utilidad</h3>
      <ul className="space-y-1 text-sm">
        {rangos.map((r) => (
          <li
            key={r.id}
            className="flex justify-between items-center border-b py-2"
          >
            <span>
              {r.min} – {r.max === Infinity ? "∞" : r.max}:{" "}
              <span className="font-semibold text-blue-600">
                {r.porcentaje}%
              </span>
            </span>
            <span className="flex gap-3">
              <button
                onClick={() => handleEditar(r)}
                className="text-blue-600 hover:underline text-xs"
              >
                Editar
              </button>
              <button
                onClick={() => handleEliminar(r.id)}
                className="text-rose-600 hover:underline text-xs"
              >
                Eliminar
              </button>
            </span>
          </li>
        ))}
        {rangos.length === 0 && (
          <li className="text-slate-400 text-sm">No hay rangos registrados.</li>
        )}
      </ul>
    </div>
  );
}
