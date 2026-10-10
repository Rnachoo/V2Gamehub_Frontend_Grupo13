import { Routes, Route } from 'react-router-dom'
import Inicio from './pages/Inicio'
import Catalogo from './pages/Catalogo'
import Producto from './pages/Producto'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import MisOrdenes from './pages/MisOrdenes'
import CrearCuenta from './pages/CrearCuenta'

function App() {
  return (
    <>
      {/* <Cabecera /> se agrega cuando exista */}
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<Producto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-ordenes" element={<MisOrdenes />} />
          <Route path="/crear-cuenta" element={<CrearCuenta />} />
        </Routes>
      </main>
      {/* <PieDePagina /> se agrega cuando exista */}
    </>
  )
}

export default App