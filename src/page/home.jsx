import "../App.css";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { products } from "../data/products";

const featuredProduct = products.find((product) => product.featured) ?? products[0];
const productGroups = products.reduce((groups, product) => {
  if (!groups[product.category]) {
    groups[product.category] = [];
  }

  groups[product.category].push(product);
  return groups;
}, {});

function Home({ user, onLogin = () => {}, onLogout = () => {}, isAdmin = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <div className="logo-mark">3D</div>
          <span>TAMTECH</span>
        </div>

        <button
          type="button"
          className={`mobile-menu-toggle ${menuOpen ? "open" : ""}`}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label="Abrir menú de navegación"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`mobile-menu-panel ${menuOpen ? "open" : ""}`}>
          <nav id="main-nav" className="main-nav mobile-nav">
            <a href="/" onClick={closeMenu}>Inicio</a>
            <a href="#catalogo" onClick={closeMenu}>Productos</a>
            {!user ? (
              <button type="button" className="nav-login-button" onClick={() => { onLogin(); closeMenu(); }}>
                Iniciar sesión
              </button>
            ) : (
              <>
                {isAdmin && (
                  <Link to="/admin" className="nav-admin-link" onClick={closeMenu}>
                    Admin
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/mi-cuenta" className="nav-admin-link" onClick={closeMenu}>
                    Mi cuenta
                  </Link>
                )}
                <span className="welcome-text">{user.name}</span>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">IMPRESIÓN 3D</p>

            <h1>
              Diseños que
              <br />
              cobran <span>vida.</span>
            </h1>

            <p>
              Descubre productos únicos fabricados mediante impresión 3D.
              Diseños funcionales, decorativos y personalizados.
            </p>

            <div className="hero-buttons">
              <a href="#catalogo" className="primary-button">
                Ver productos →
              </a>

              <a href="/personalizar" className="secondary-button">
                Personalizar
              </a>
            </div>
          </div>

          <Link to={`/producto/${featuredProduct.id}`} className="hero-image">
            <img src={featuredProduct.image} alt={featuredProduct.name} loading="eager" />
            <div>
              <span>PRODUCTO DESTACADO</span>
              <strong>{featuredProduct.name}</strong>
            </div>
          </Link>
        </section>

        {/* CATALOGO */}
        <section className="products-section">
          <div className="section catalog-section" id="catalogo">
            <p className="eyebrow">CATÁLOGO TAMTECH</p>
            <h2>Productos disponibles</h2>

            {Object.entries(productGroups).map(([category, categoryProducts]) => (
              <section className="product-group" key={category}>
                <div className="section-title group-title">
                  <h3>{category}</h3>
                  <span>{categoryProducts.length} productos</span>
                </div>
                <div className="products">
                  {categoryProducts.map((product) => (
                    <Product key={product.image} {...product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        {/* BENEFICIOS */}
        <section className="benefits">
          <div>
            <strong>🚚 Entrega en La Paz</strong>
            <span>Recibe tus productos fácilmente</span>
          </div>

          <div>
            <strong>🖨️ Fabricación propia</strong>
            <span>Imprimimos directamente tus diseños</span>
          </div>

          <div>
            <strong>🎨 Personalizados</strong>
            <span>Podemos crear tu idea</span>
          </div>

          <div>
            <strong>💬 Atención directa</strong>
            <span>Estamos para ayudarte</span>
          </div>
        </section>

        <section className="location-section">
          <div className="location-heading">
            <p className="eyebrow">VISÍTANOS</p>
            <h2>Encuéntranos en La Paz</h2>
            <p>
              Ven a conocer nuestros productos en la Galería 926 o escríbenos
              para coordinar tu pedido.
            </p>
          </div>

          <div className="location-content">
            <div className="location-card facade-card">
              <div className="facade-placeholder">
                <span aria-hidden="true">▧</span>
                <strong>Fachada de la galería</strong>
                <p>Agrega tu foto en public/fachada-galeria.webp</p>
              </div>
              <p className="location-caption">TAMTECH · Galería 926</p>
            </div>

            <div className="location-card map-card">
              <iframe
                title="Ubicación de TAMTECH en La Paz"
                src="https://www.google.com/maps?q=Av.%20Mariscal%20Santa%20Cruz%2C%20Galeria%20926%2C%20La%20Paz%2C%20Bolivia&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                className="map-link"
                href="https://maps.app.goo.gl/RgZSa1kgwQyH1Tjo8"
                target="_blank"
                rel="noreferrer"
              >
                Abrir ubicación en Google Maps →
              </a>
            </div>

            <div className="location-card contact-card">
              <p className="eyebrow">DIRECCIÓN Y CONTACTO</p>
              <h3>Visítanos o contáctanos</h3>
              <address>
                Av. Mariscal Santa Cruz<br />
                Galería 926, 2do Piso, Oficina 7<br />
                La Paz, Bolivia
              </address>
              <div className="reference-numbers">
                <span>Números de referencia</span>
                <a href="tel:+59163197049">+591 63197049</a>
                <a href="tel:+59178945474">+591 78945474</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="logo">
          <div className="logo-mark">3D</div>
          <span>TAMTECH</span>
        </div>

        <p>© 2026 TAMTECH · Impresión 3D</p>
      </footer>
    </div>
  );
}

function Product({ id, image, name, category, price }) {
  return (
    <article className="product">
      <div className="product-image">
        <img src={image} alt={name} loading="lazy" decoding="async" />
        <small>En stock</small>
      </div>

      <div className="product-info">
        <p>{category}</p>
        <h3>{name}</h3>

        <div className="product-price">
          <strong>Bs. {price}</strong>
          <Link
            to={`/producto/${id}`}
            className="product-detail-link"
            aria-label={`Ver detalle de ${name}`}
          >
            Ver detalle <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default Home;