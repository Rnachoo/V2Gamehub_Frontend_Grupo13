import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/tema.css'
import './styles/base.css'
import './styles/encabezado-pie.css'
import './styles/inicio.css'
import './styles/catalogo.css'
import './styles/compartido.css'
import './styles/checkout.css'
import './styles/mis-ordenes.css'
import './styles/crear-cuenta.css'
import './styles/bootstrap-personalizado.css'
import './index.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import App from './App.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CarritoProvider>
        <App />
      </CarritoProvider>
    </BrowserRouter>
  </StrictMode>,
)