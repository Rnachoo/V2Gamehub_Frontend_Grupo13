// Función para mostrar los filtros del catálogo
export default function FiltroCatalogo({
  filtros,
  categorias,
  marcas,
  errorPrecios,
  alCambiar,
  alAplicar,
  alLimpiar
}) {
  // Función para avisar a la vista cuando cambia un campo
  function cambiarFiltro(evento) {
    const { name, value, type, checked } = evento.target

    alCambiar({
      ...filtros,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  // Función para aplicar los filtros sin recargar la página
  function enviarFormulario(evento) {
    evento.preventDefault()
    alAplicar()
  }

  return (
    <aside className="contenedor-panel-filtros" aria-label="Filtros del catálogo">
      <details className="panel-filtros" open>
        <summary>
          <h2>Filtros</h2>
        </summary>

        <div className="contenido-filtros">
          <div className="encabezado-filtros">
            <button type="button" className="boton-secundario" onClick={alLimpiar}>
              Limpiar
            </button>
          </div>

          <form onSubmit={enviarFormulario}>
            <div className="campo-filtro">
              <label htmlFor="busqueda-producto">Buscar producto</label>
              <input
                id="busqueda-producto"
                type="search"
                name="busqueda"
                placeholder="Nombre o marca"
                value={filtros.busqueda}
                onChange={cambiarFiltro}
              />
            </div>

            <div className="campo-filtro">
              <label htmlFor="filtro-categoria">Categoría</label>
              <select
                id="filtro-categoria"
                name="categoria"
                value={filtros.categoria}
                onChange={cambiarFiltro}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo-filtro">
              <label htmlFor="filtro-marca">Marca</label>
              <select
                id="filtro-marca"
                name="marca"
                value={filtros.marca}
                onChange={cambiarFiltro}
              >
                <option value="">Todas las marcas</option>
                {marcas.map((marca) => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>

            <fieldset className="grupo-precios">
              <legend>Rango de precio</legend>

              <div className="campos-precio">
                <div className="campo-filtro">
                  <label htmlFor="precio-minimo">Precio mínimo</label>
                  <input
                    id="precio-minimo"
                    type="number"
                    name="precioMinimo"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={filtros.precioMinimo}
                    onChange={cambiarFiltro}
                    aria-describedby="error-precios"
                    aria-invalid={Boolean(errorPrecios)}
                  />
                </div>

                <div className="campo-filtro">
                  <label htmlFor="precio-maximo">Precio máximo</label>
                  <input
                    id="precio-maximo"
                    type="number"
                    name="precioMaximo"
                    min="0"
                    step="1"
                    placeholder="1000000"
                    value={filtros.precioMaximo}
                    onChange={cambiarFiltro}
                    aria-describedby="error-precios"
                    aria-invalid={Boolean(errorPrecios)}
                  />
                </div>
              </div>

              <span id="error-precios" className="mensaje-error" role="alert">
                {errorPrecios}
              </span>
            </fieldset>

            <div className="campo-stock">
              <input
                id="solo-con-stock"
                type="checkbox"
                name="soloConStock"
                checked={filtros.soloConStock}
                onChange={cambiarFiltro}
              />
              <label htmlFor="solo-con-stock">
                Mostrar solamente productos disponibles
              </label>
            </div>

            <button type="submit" className="boton-primario">
              Aplicar filtros
            </button>
          </form>
        </div>
      </details>
    </aside>
  )
}