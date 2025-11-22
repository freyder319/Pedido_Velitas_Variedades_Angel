import React, { useState } from 'react';
import './App.css';
import logoEmpresa from './assets/LogoEmpresa.png';

const API_BASE = 'https://pedido-velitas-variedades-angel-3.onrender.com';

function App() {
  const isAdmin = window.location.pathname === '/admin';
  const velaImg = require('./assets/Gemini_Generated_Image_3ytw0z3ytw0z3ytw.png');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [paquetes, setPaquetes] = useState([
    Array.from({ length: 10 }, () => ''),
  ]);
  const [showErrors, setShowErrors] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChangeVela = (indexPaquete, indexVela, value) => {
    setPaquetes((prev) =>
      prev.map((velas, pIndex) =>
        pIndex === indexPaquete
          ? velas.map((v, vIndex) => (vIndex === indexVela ? value : v))
          : velas,
      ),
    );
  };

  const handleAddPaquete = () => {
    setPaquetes((prev) => [...prev, Array.from({ length: 10 }, () => '')]);
  };

  const handleRemovePaquete = (indexPaquete) => {
    setPaquetes((prev) => {
      if (prev.length === 1) {
        return [Array.from({ length: 10 }, () => '')];
      }
      return prev.filter((_, i) => i !== indexPaquete);
    });
  };

  const handleTelefonoBlur = async () => {
    const limpio = telefono.trim();
    if (!limpio) return;

    try {
      const res = await fetch(
        `${API_BASE}/clientes/telefono/${encodeURIComponent(limpio)}`,
      );
      if (!res.ok) return;

      const data = await res.json();
      if (data.existe && data.nombreCompleto) {
        setNombreCompleto(data.nombreCompleto);
        setShowErrors(false);
      }
    } catch (err) {
      console.error('Error buscando cliente por teléfono', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasEmpty = false;
    const nombreEmpty = !nombreCompleto.trim();
    const telefonoEmpty = !telefono.trim();

    if (nombreEmpty || telefonoEmpty) {
      hasEmpty = true;
    }

    paquetes.forEach((velas) => {
      velas.forEach((v) => {
        if (!v.trim()) {
          hasEmpty = true;
        }
      });
    });

    if (hasEmpty) {
      setShowErrors(true);

      setTimeout(() => {
        const firstError = document.querySelector('.text-input-error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 0);

      return;
    }

    const payload = {
      nombreCompleto,
      telefono,
      paquetes,
    };

    try {
      const res = await fetch(`${API_BASE}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Error al enviar el pedido');
      }

      setNombreCompleto('');
      setTelefono('');
      setPaquetes([Array.from({ length: 10 }, () => '')]);
      setShowErrors(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert('Hubo un problema al enviar el pedido');
    }
  };

  if (isAdmin) {
    return <AdminPedidos />;
  }

  return (
    <div className="page">
      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-header">
          <img src={logoEmpresa} alt="Logo de la empresa" className="logo-empresa" />
          <h1 className="form-title">Velitas Personalizadas</h1>
        </div>

        <p className="form-description">
          Ingresa el nombre o frase que deseas para tu vela personalizada.
          {'\n'}Este formulario te permitirá elegir el texto que irá impreso en tu vela, ya sea un nombre, una dedicatoria especial o una palabra significativa. Asegúrate de escribirlo exactamente como deseas que aparezca (incluyendo acentos y mayúsculas).
          {'\n\n'}Puedes incluir:
          {'\n'}Nombres propios
          {'\n'}Fechas especiales
          {'\n'}Frases cortas o palabras inspiradoras
          {'\n'}Iniciales o combinaciones creativas
          {'\n\n'}Tu mensaje será grabado con cuidado para que tu vela sea única y especial.
        </p>

        <div className="field-group">
          <label className="field-label" htmlFor="nombre-completo">
            Nombre completo
          </label>
          <div className="candle-input-wrapper">
            <input
              id="nombre-completo"
              className={`text-input ${
                showErrors && !nombreCompleto.trim() ? 'text-input-error' : ''
              } ${
                nombreCompleto.trim() ? 'text-input-success' : ''
              }`}
              type="text"
              placeholder="Escribe tu nombre completo"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
            />
            {nombreCompleto.trim() && (
              <span className="candle-check">✓</span>
            )}
          </div>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="telefono">
            Teléfono
          </label>
          <div className="candle-input-wrapper">
            <input
              id="telefono"
              className={`text-input ${
                showErrors && !telefono.trim() ? 'text-input-error' : ''
              } ${telefono.trim() ? 'text-input-success' : ''}`}
              type="tel"
              placeholder="Escribe tu número de teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              onBlur={handleTelefonoBlur}
            />
            {telefono.trim() && <span className="candle-check">✓</span>}
          </div>
        </div>

        <div className="field-group">
          {paquetes.map((velas, indexPaquete) => (
            <div className="candles-box" key={indexPaquete}>
              <div className="candles-box-header">
                <p className="packages-section-title">
                  Paquete {indexPaquete + 1}: Escribe el nombre para cada vela (10 en total)
                </p>
                <button
                  type="button"
                  className="remove-package-btn"
                  onClick={() => handleRemovePaquete(indexPaquete)}
                >
                  Eliminar paquete
                </button>
              </div>

              <div id="candles-container">
                {velas.map((valor, indexVela) => {
                  const isEmpty = !valor.trim();
                  const isValid = !isEmpty && valor.length <= 30;
                  const inputClass = [
                    'text-input',
                    showErrors && isEmpty ? 'text-input-error' : '',
                    isValid ? 'text-input-success' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <div className="candle-row" key={indexVela}>
                      <div className="candle-image">
                        <img
                          src={velaImg}
                          alt={`Vela ${indexVela + 1}`}
                          className="candle-image-img"
                        />
                      </div>
                      <div className="candle-input-wrapper">
                        <input
                          className={inputClass}
                          type="text"
                          maxLength={30}
                          placeholder={`Nombre o frase para la vela ${indexVela + 1}`}
                          value={valor}
                          onChange={(e) =>
                            handleChangeVela(
                              indexPaquete,
                              indexVela,
                              e.target.value,
                            )
                          }
                        />
                        {isValid && <span className="candle-check">✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            type="button"
            className="add-package-btn"
            onClick={handleAddPaquete}
          >
            Agregar más paquetes
          </button>
        </div>

        <button type="submit" className="submit-btn">
          Enviar pedido
        </button>
      </form>

      {showSuccessModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="modal-title">¡Pedido enviado!</h2>
            <p className="modal-text">
              Tu pedido De Velitas ha sido registrado correctamente.
            </p>
            <button
              type="button"
              className="submit-btn modal-close-btn"
              onClick={() => setShowSuccessModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

function AdminPedidos() {
  const [clave, setClave] = useState('');
  const [telefonoFiltro, setTelefonoFiltro] = useState('');
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [autorizado, setAutorizado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
  const [paquetesConfirmados, setPaquetesConfirmados] = useState({});

  const construirMapaConfirmados = (pedidosLista) => {
    const mapa = {};
    pedidosLista.forEach((pedido) => {
      const velas = pedido.velas || [];
      const totalPaquetes = Math.ceil(velas.length / 10);
      const confirmados = [];

      for (let i = 0; i < totalPaquetes; i++) {
        const start = i * 10;
        const end = start + 10;
        const slice = velas.slice(start, end);
        if (slice.length > 0 && slice.every((v) => v.confirmado)) {
          confirmados.push(i);
        }
      }

      if (confirmados.length > 0) {
        mapa[pedido.id] = confirmados;
      }
    });
    return mapa;
  };

  const cargarPedidos = async () => {
    setMensaje('');
    setPedidoSeleccionado(null);
    setPaqueteSeleccionado(null);

    const params = new URLSearchParams();
    params.set('clave', clave);
    if (telefonoFiltro.trim()) {
      params.set('telefono', telefonoFiltro.trim());
    }

    try {
      const res = await fetch(
        `${API_BASE}/admin/pedidos?${params.toString()}`,
      );
      if (!res.ok) {
        setMensaje('Error al consultar pedidos');
        return;
      }

      const data = await res.json();
      if (!data.autorizado) {
        setAutorizado(false);
        setPedidos([]);
        setMensaje(data.mensaje || 'Clave incorrecta');
        return;
      }

      setAutorizado(true);
      const pedidosLista = Array.isArray(data.pedidos) ? data.pedidos : [];
      setPedidos(pedidosLista);
      setPaquetesConfirmados(construirMapaConfirmados(pedidosLista));
      setMensaje('');
    } catch (err) {
      console.error('Error cargando pedidos de admin', err);
      setMensaje('Error al cargar pedidos');
    }
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    const nombreOk = nombreFiltro
      ? (p.nombreCompleto || '')
          .toLowerCase()
          .includes(nombreFiltro.toLowerCase())
      : true;
    return nombreOk;
  });

  const obtenerPaquetesDePedido = (pedido) => {
    const velas = pedido.velas || [];
    const paquetes = [];
    for (let i = 0; i < velas.length; i += 10) {
      paquetes.push(velas.slice(i, i + 10));
    }
    return paquetes;
  };

  const manejarClickPaquete = (pedido, indexPaquete) => {
    setPedidoSeleccionado(pedido);
    setPaqueteSeleccionado(indexPaquete);
  };

  const confirmarPaqueteSeleccionado = async () => {
    if (!pedidoSeleccionado || paqueteSeleccionado === null) return;

    try {
      const res = await fetch(
        `${API_BASE}/admin/pedidos/${pedidoSeleccionado.id}/confirmar-paquete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clave, indexPaquete: paqueteSeleccionado }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMensaje(data.mensaje || 'No se pudo confirmar el paquete');
        return;
      }

      await cargarPedidos();
      setMensaje('Paquete confirmado correctamente');
    } catch (err) {
      console.error('Error confirmando paquete', err);
      setMensaje('Error al confirmar paquete');
    }
  };

  const paquetesSeleccionados =
    pedidoSeleccionado && paqueteSeleccionado !== null
      ? obtenerPaquetesDePedido(pedidoSeleccionado)[paqueteSeleccionado]
      : [];

  return (
    <div className="page admin-page">
      <div className="admin-container">
        <h1 className="form-title">Panel de administración - Pedidos</h1>

        <div className="admin-filtros">
          <div className="field-group">
            <label className="field-label" htmlFor="clave-admin">
              Clave de administrador
            </label>
            <input
              id="clave-admin"
              type="password"
              className="text-input"
              placeholder="Ingresa la clave"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="filtro-telefono">
              Filtrar por teléfono
            </label>
            <input
              id="filtro-telefono"
              className="text-input"
              type="tel"
              placeholder="Número de teléfono"
              value={telefonoFiltro}
              onChange={(e) => setTelefonoFiltro(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="filtro-nombre">
              Filtrar por nombre
            </label>
            <input
              id="filtro-nombre"
              className="text-input"
              type="text"
              placeholder="Nombre del cliente"
              value={nombreFiltro}
              onChange={(e) => setNombreFiltro(e.target.value)}
            />
          </div>

          <button type="button" className="submit-btn" onClick={cargarPedidos}>
            Ver pedidos
          </button>
        </div>

        {mensaje && <p className="admin-mensaje">{mensaje}</p>}

        {autorizado && (
          <div className="admin-contenido">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Total velas</th>
                  <th>Paquetes</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((pedido) => {
                  const paquetes = obtenerPaquetesDePedido(pedido);
                  return (
                    <tr key={pedido.id}>
                      <td>{pedido.id}</td>
                      <td>{pedido.nombreCompleto}</td>
                      <td>{pedido.telefono}</td>
                      <td>{(pedido.velas || []).length}</td>
                      <td>
                        <div className="admin-paquetes-lista">
                          {paquetes.map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              className={`admin-paquete-btn ${
                                (paquetesConfirmados[pedido.id] || []).includes(index)
                                  ? 'admin-paquete-btn-confirmado'
                                  : ''
                              }`}
                              onClick={() => manejarClickPaquete(pedido, index)}
                            >
                              Paquete {index + 1}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {pedidoSeleccionado && paqueteSeleccionado !== null && (
              <div className="admin-detalle-paquete">
                <h2>
                  Pedido #{pedidoSeleccionado.id} - {pedidoSeleccionado.nombreCompleto} - Paquete{' '}
                  {paqueteSeleccionado + 1}
                </h2>
                <button
                  type="button"
                  className="submit-btn admin-confirmar-paquete-btn"
                  onClick={confirmarPaqueteSeleccionado}
                >
                  Confirmar paquete
                </button>
                <ul>
                  {paquetesSeleccionados.map((vela, index) => (
                    <li key={vela.id || index}>
                      Vela {index + 1}: {vela.texto}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
