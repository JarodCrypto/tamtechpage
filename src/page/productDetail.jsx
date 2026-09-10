import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getWhatsAppLink, products } from "../data/products";

function ProductDetail() {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <main className="not-found">
        <p className="eyebrow">PRODUCTO NO ENCONTRADO</p>
        <h1>Este producto no existe.</h1>
        <Link to="/" className="primary-button">
          Volver al inicio
        </Link>
      </main>
    );
  }

  return (
    <div className="detail-page">
      <header className="navbar">
        <Link to="/" className="logo">
          <div className="logo-mark">3D</div>
          <span>TAMTECH</span>
        </Link>

        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/">Productos</Link>
        </nav>
      </header>

      <main className="detail-main">
        <Link to="/" className="back-link">
          ← Volver a productos
        </Link>

        <section className="product-detail">
          <div className="detail-gallery">
            <div className="detail-image">
              <img src={product.image} alt={product.name} />
            </div>
            <p className="gallery-caption">Imagen de muestra del producto</p>
          </div>

          <div className="detail-info">
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="detail-description">
              Producto fabricado mediante impresión 3D. Escríbenos para
              confirmar disponibilidad, colores y opciones de personalización.
            </p>

            <div className="detail-price">Bs. {product.price}</div>

            <div className="quantity-field">
              <label htmlFor="quantity">Cantidad</label>
              <div className="quantity-control">
                <button
                  type="button"
                  aria-label="Disminuir cantidad"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Math.max(1, Number(event.target.value) || 1))
                  }
                />
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  onClick={() => setQuantity((current) => current + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <a
              className="whatsapp-button"
              href={getWhatsAppLink(product, quantity)}
              target="_blank"
              rel="noreferrer"
            >
              <span aria-hidden="true">💬</span>
              Consultar por WhatsApp
            </a>
            <p className="contact-note">
              Te ayudaremos a confirmar el pedido y coordinar la entrega.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductDetail;
