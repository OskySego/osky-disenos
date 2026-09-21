import React from 'react';

export const ResenasPage = () => {
  const reviews = [
    { nombre: "Martín R.", comentario: "Excelente atención y entrega rápida de mi landing page.", rating: 5 },
    { nombre: "Carolina G.", comentario: "Los volantes y el logo quedaron geniales. Super recomendable.", rating: 5 },
    { nombre: "Lucía P.", comentario: "El soporte 24/7 me ayudó mucho con mis dudas iniciales.", rating: 5 }
  ];

  return (
    <>
      <section className="hero parallax">
        <div className="hero-content">
          <h1 className="typewriter">Lo que dicen mis clientes</h1>
          <p className="intro-text">Más de 5 años creando diseños que impulsan marcas argentinas</p>
          <div className="reviews-stats">
            <div className="rating-big">4.9 <span>/5</span></div>
            <div className="stars-big">★★★★★</div>
            <p>Basado en 92 reseñas reales</p>
          </div>
        </div>
      </section>

      <section className="reseñas-grid-page" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {reviews.map((r, i) => (
          <div key={i} className="box-card">
            <h4>{r.nombre}</h4>
            <p style={{ color: '#ffd700' }}>{'★'.repeat(r.rating)}</p>
            <p>"{r.comentario}"</p>
          </div>
        ))}
      </section>
    </>
  );
};