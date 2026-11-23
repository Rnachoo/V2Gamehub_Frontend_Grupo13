import { useState } from 'react'

const VACIO = {
  nombre: '',
  marca: '',
  modelo: '',
  categoriaIdBackend: '',
  precio: '',
  precioDescuento: '',
  stock: '0',
  destacado: false,
  descripcion: '',
  imagenes: '',
  especificaciones: ''
}

function desdeProducto(producto) {
  return {
    ...VACIO,
    ...producto,
    precio: String(producto.precio),
    precioDescuento: producto.precioDescuento == null ? '' : String(producto.precioDescuento),
    categoriaIdBackend: String(producto.categoriaIdBackend),
    imagenes: producto.imagenes.filter((url) => url !== '/favicon.png').join('\n'),
    especificaciones: producto.especificaciones.join('\n')
  }
}

const aLista = (texto) => texto.split('\n').map((linea) => linea.trim()).filter(Boolean)

function validar(valores, esNuevo) {
  const errores = {}
  const precio = Number(valores.precio)

  if (!valores.nombre.trim()) errores.nombre = 'El nombre es obligatorio.'
  if (!valores.marca.trim()) errores.marca = 'La marca es obligatoria.'
  if (!valores.categoriaIdBackend) errores.categoriaId = 'Elige una categoría.'
  if (!Number.isInteger(precio) || precio <= 0) {
    errores.precio = 'El precio debe ser un número entero mayor que cero.'
  }
  if (valores.precioDescuento !== '') {
    const descuento = Number(valores.precioDescuento)
    if (!Number.isInteger(descuento) || descuento <= 0 || descuento >= precio) {
      errores.precioDescuento = 'El precio con descuento debe ser menor que el precio normal.'
    }
  }
  if (esNuevo && (!Number.isInteger(Number(valores.stock)) || Number(valores.stock) < 0)) {
    errores.stock = 'El stock inicial debe ser un entero de 0 o más.'
  }
  if (valores.descripcion.length > 500) {
    errores.descripcion = 'La descripción no puede superar los 500 caracteres.'
  }
  return errores
}

export default function FormularioProducto({ producto, categorias, erroresServidor = {}, guardando, alGuardar, alCancelar }) {
  const esNuevo = !producto
  const [valores, setValores] = useState(() => (producto ? desdeProducto(producto) : VACIO))
  const [errores, setErrores] = useState({})
  const todosLosErrores = { ...erroresServidor, ...errores }

  function cambiar(evento) {
    const { name, value, type, checked } = evento.target
    setValores({ ...valores, [name]: type === 'checkbox' ? checked : value })
  }

  function enviar(evento) {
    evento.preventDefault()
    const nuevosErrores = validar(valores, esNuevo)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    alGuardar({
      ...valores,
      imagenes: aLista(valores.imagenes),
      especificaciones: aLista(valores.especificaciones)
    })
  }

  function campo(nombre, etiqueta, props = {}) {
    const claveError = nombre === 'categoriaIdBackend' ? 'categoriaId' : nombre
    return (
      <div className="campo-admin">
        <label htmlFor={`producto-${nombre}`}>{etiqueta}</label>
        <input
          id={`producto-${nombre}`}
          name={nombre}
          className="form-control"
          value={valores[nombre]}
          onChange={cambiar}
          aria-invalid={Boolean(todosLosErrores[claveError])}
          {...props}
        />
        {todosLosErrores[claveError] && <span className="mensaje-error">{todosLosErrores[claveError]}</span>}
      </div>
    )
  }

  return (
    <form className="formulario-admin" onSubmit={enviar} noValidate>
      <h3>{esNuevo ? 'Nuevo producto' : `Editar: ${producto.nombre}`}</h3>

      <div className="grid-formulario-admin">
        {campo('nombre', 'Nombre')}
        {campo('marca', 'Marca')}
        {campo('modelo', 'Modelo (opcional)')}

        <div className="campo-admin">
          <label htmlFor="producto-categoria">Categoría</label>
          <select
            id="producto-categoria"
            name="categoriaIdBackend"
            className="form-select"
            value={valores.categoriaIdBackend}
            onChange={cambiar}
            aria-invalid={Boolean(todosLosErrores.categoriaId)}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.filter((categoria) => categoria.activa).map((categoria) => (
              <option key={categoria.idBackend} value={categoria.idBackend}>{categoria.nombre}</option>
            ))}
          </select>
          {todosLosErrores.categoriaId && <span className="mensaje-error">{todosLosErrores.categoriaId}</span>}
        </div>

        {campo('precio', 'Precio (CLP)', { type: 'number', min: 1, step: 1 })}
        {campo('precioDescuento', 'Precio con descuento (opcional)', { type: 'number', min: 1, step: 1 })}
        {esNuevo && campo('stock', 'Stock inicial', { type: 'number', min: 0, step: 1 })}
      </div>

      <div className="campo-admin">
        <label htmlFor="producto-descripcion">Descripción</label>
        <textarea id="producto-descripcion" name="descripcion" className="form-control" rows="2" value={valores.descripcion} onChange={cambiar} />
        {todosLosErrores.descripcion && <span className="mensaje-error">{todosLosErrores.descripcion}</span>}
      </div>

      <div className="grid-formulario-admin">
        <div className="campo-admin">
          <label htmlFor="producto-imagenes">Imágenes (una URL por línea)</label>
          <textarea id="producto-imagenes" name="imagenes" className="form-control" rows="3" value={valores.imagenes} onChange={cambiar} />
        </div>
        <div className="campo-admin">
          <label htmlFor="producto-especificaciones">Especificaciones (una por línea)</label>
          <textarea id="producto-especificaciones" name="especificaciones" className="form-control" rows="3" value={valores.especificaciones} onChange={cambiar} />
        </div>
      </div>

      <div className="form-check">
        <input id="producto-destacado" name="destacado" type="checkbox" className="form-check-input" checked={valores.destacado} onChange={cambiar} />
        <label htmlFor="producto-destacado" className="form-check-label">Mostrar como destacado en Inicio</label>
      </div>

      <div className="acciones-admin">
        <button type="submit" className="boton-primario" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="boton-secundario" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  )
}
