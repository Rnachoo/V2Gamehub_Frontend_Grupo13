function ordenarResenasPorFecha(resenas) {
    return [...resenas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

function calcularPromedio(resenas) {
    if (resenas.length === 0) return 0;
    const suma = resenas.reduce((acumulado, resena) => acumulado + resena.calificacion, 0);
    return suma / resenas.length;
}

export default function ListaResenas({ resenas }) {
    const resenasOrdenadas = ordenarResenasPorFecha(resenas);
    const promedio = calcularPromedio(resenasOrdenadas)

    return (
        <section className="resenas-productos" aria-labelledby="titulo-resenas">
            <h2 id="titulo-resenas">Reseñas del producto</h2>
            <p>
                Promedio : {promedio.toFixed(1)} / 5 ({resenasOrdenadas.length} reseñas)
            </p>

            <ul className="lista-resenas" aria-label="Lista de reseñas del producto">
                {resenasOrdenadas.length === 0 && <li>Este producto aún no ha sido reseñado.</li>}
                {resenasOrdenadas.map((resena) => (
                <li key={resena.id} className="tarjeta resena">
                    <p className="resena-autor">
                    {resena.autor} — {'★'.repeat(resena.calificacion) + '☆'.repeat(5 - resena.calificacion)}
                    </p>
                    <p>{resena.comentario}</p>
                    <p className="resena-fecha">
                    {new Date(resena.fecha).toLocaleDateString('es-CL', { timeZone: 'UTC' })}
                    </p>
                </li>
            ))}
            </ul>
        </section>
    )
}