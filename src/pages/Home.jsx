import PortadaOsky from '../components/PortadaOsky';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import { TarjetaBeneficio } from '../components/TarjetaBeneficio';
import { OfertasDestacadas } from '../components/OfertasDestacadas';

/**
 * Página principal de la ruta `/`. La cabecera y el pie de página
 * siguen siendo administrados por Layout.jsx.
 */
export const Home = () => (
  <>
    <PortadaOsky />
    <OfertasDestacadas />

    <section className="why-us-section" aria-labelledby="por-que-osky">
      <h2 className="why-us-title" id="por-que-osky">
        ¿Por qué elegir Osky Diseños?
      </h2>
      {/* React-Bootstrap: grilla real, sin modificar el diseño de las tarjetas. */}
      <Container fluid style={{ maxWidth: '1200px', paddingInline: '12px' }}>
        <Row className="g-4" style={{ justifyContent: 'center' }}>
          <Col xs={12} md={6} lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
            <TarjetaBeneficio className="box-card violet">
              <h3>Diseños personalizados</h3>
              <p>Una identidad que representa tu proyecto, en lugar de depender de soluciones genéricas.</p>
            </TarjetaBeneficio>
          </Col>
          <Col xs={12} md={6} lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
            <TarjetaBeneficio className="box-card green">
              <h3>Una propuesta clara</h3>
              <p>Desde una pieza para redes hasta una página web: elegí lo que necesita tu emprendimiento.</p>
            </TarjetaBeneficio>
          </Col>
          <Col xs={12} md={6} lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
            <TarjetaBeneficio className="box-card gold">
              <h3>Acompañamiento</h3>
              <p>Conversamos sobre tus objetivos para crear una solución alineada con tu marca.</p>
            </TarjetaBeneficio>
          </Col>
        </Row>
      </Container>
    </section>
  </>
);
