import { Routes, Route } from 'react-router-dom'
import Inicio from './pages/Inicio'
import Catalogo from './pages/Catalogo'
import Producto from './pages/Producto'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import MisOrdenes from './pages/MisOrdenes'
import CrearCuenta from './pages/CrearCuenta'
import Cabecera from './components/Cabecera'
import PieDePagina from './components/PieDePagina'
import Login from './pages/Login'
import RutaProtegida from './components/RutaProtegida'
import AvisoSesion from './components/AvisoSesion'

function App() {
  return (
    <>
      <Cabecera />
        <AvisoSesion />
        <main>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/producto/:id" element={<Producto />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/login" element={<Login />} />
            <Route path="/crear-cuenta" element={<CrearCuenta />} />

            {/* Exigen sesión iniciada */}
            <Route element={<RutaProtegida />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/mis-ordenes" element={<MisOrdenes />} />
            </Route>
          </Routes>
        </main>
      <PieDePagina />
    </>
  )
}

export default App