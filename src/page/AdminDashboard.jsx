import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";

function AdminDashboard({ user, isAdmin = false, currentUserId = null }) {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("overview");

  const filterOptions = isAdmin
    ? [
        { id: "overview", label: "Resumen" },
        { id: "customers", label: "Clientes" },
        { id: "products", label: "Productos" },
        { id: "favorites", label: "Favoritos" },
      ]
    : [
        { id: "overview", label: "Resumen" },
        { id: "favorites", label: "Favoritos" },
        { id: "orders", label: "Pedidos" },
      ];

  useEffect(() => {
    const usersRef = collection(db, "users");
    const ordersRef = collection(db, "orders");
    const favoritesRef = collection(db, "favorites");

    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubOrders = onSnapshot(query(ordersRef, orderBy("createdAt", "desc")), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubFavorites = onSnapshot(favoritesRef, (snapshot) => {
      setFavorites(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);

    return () => {
      unsubUsers();
      unsubOrders();
      unsubFavorites();
    };
  }, []);

  const visibleOrders = useMemo(() => {
    if (!isAdmin && currentUserId) {
      return orders.filter((order) => order.userId === currentUserId);
    }
    return orders;
  }, [orders, isAdmin, currentUserId]);

  const visibleFavorites = useMemo(() => {
    if (!isAdmin && currentUserId) {
      return favorites.filter((favorite) => favorite.userId === currentUserId);
    }
    return favorites;
  }, [favorites, isAdmin, currentUserId]);

  const metrics = useMemo(() => {
    if (!isAdmin) {
      const totalOrders = visibleOrders.length;
      const totalFavorites = visibleFavorites.length;
      const favoriteProducts = visibleFavorites
        .slice(0, 5)
        .map((favorite) => ({
          name: favorite.productName || favorite.name || "Producto favorito",
          count: 1,
        }));
      const lastOrders = visibleOrders
        .slice(0, 5)
        .map((order) => ({
          name: order.productName || order.productId || "Pedido",
          count: 1,
          date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Sin fecha",
        }));

      return {
        totalUsers: 1,
        totalOrders,
        totalFavorites,
        topCustomers: [],
        topProducts: favoriteProducts,
        mostSavedUsers: [],
        lastOrders,
        maxCustomerCount: 1,
        maxProductCount: Math.max(1, favoriteProducts.length),
        maxFavoriteCount: 1,
      };
    }

    const totalUsers = users.length;
    const totalOrders = visibleOrders.length;
    const totalFavorites = visibleFavorites.length;

    const userOrderCount = users.map((item) => {
      const count = visibleOrders.filter((order) => order.userId === item.uid).length;
      return {
        uid: item.uid,
        name: item.name,
        email: item.email,
        count,
      };
    });

    const topCustomers = [...userOrderCount]
      .filter((userItem) => userItem.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const productCount = visibleOrders.reduce((acc, order) => {
      const key = order.productId || order.productName || "Sin producto";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topProducts = Object.entries(productCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const favoriteCount = users.map((item) => ({
      uid: item.uid,
      name: item.name,
      email: item.email,
      count: visibleFavorites.filter((fav) => fav.userId === item.uid).length,
    }));

    const mostSavedUsers = [...favoriteCount]
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maxCustomerCount = Math.max(1, ...topCustomers.map((item) => item.count));
    const maxProductCount = Math.max(1, ...topProducts.map((item) => item.count));
    const maxFavoriteCount = Math.max(1, ...mostSavedUsers.map((item) => item.count));

    return {
      totalUsers,
      totalOrders,
      totalFavorites,
      topCustomers,
      topProducts,
      mostSavedUsers,
      lastOrders: [],
      maxCustomerCount,
      maxProductCount,
      maxFavoriteCount,
    };
  }, [users, visibleOrders, visibleFavorites, isAdmin]);

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "A";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const overviewCards = isAdmin
    ? [
        {
          label: "Top cliente",
          value: metrics.topCustomers[0]?.name || "Sin datos",
          meta: metrics.topCustomers[0]
            ? `${metrics.topCustomers[0].count} compras`
            : "Sin compras",
        },
        {
          label: "Top producto",
          value: metrics.topProducts[0]?.name || "Sin datos",
          meta: metrics.topProducts[0]
            ? `${metrics.topProducts[0].count} pedidos`
            : "Sin pedidos",
        },
        {
          label: "Más favoritos",
          value: metrics.mostSavedUsers[0]?.name || "Sin datos",
          meta: metrics.mostSavedUsers[0]
            ? `${metrics.mostSavedUsers[0].count} favoritos`
            : "Sin favoritos",
        },
      ]
    : [];

  const renderCustomerPanel = () => (
    <div className="panel-card panel-card--wide">
      <div className="panel-card__header">
        <h2>Usuarios con más compras</h2>
        <span>{metrics.topCustomers.length} clientes</span>
      </div>
      <ul className="metric-list">
        {metrics.topCustomers.length === 0 ? (
          <li className="empty-row">No hay compras todavía.</li>
        ) : (
          metrics.topCustomers.map((item, index) => (
            <li key={item.uid} className="metric-row">
              <div className="metric-rank">0{index + 1}</div>
              <div className="metric-profile">
                <span className="mini-avatar">{getInitials(item.name || item.email || "U")}</span>
                <div>
                  <strong>{item.name || "Cliente"}</strong>
                  <small>{item.email || "Sin email"}</small>
                </div>
              </div>
              <div className="metric-bar-wrap">
                <div
                  className="metric-bar metric-bar--customers"
                  style={{ width: `${(item.count / metrics.maxCustomerCount) * 100}%` }}
                />
              </div>
              <strong className="metric-number">{item.count}</strong>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  const renderProductsPanel = () => (
    <div className="panel-card">
      <div className="panel-card__header">
        <h2>Productos más pedidos</h2>
        <span>{metrics.topProducts.length} productos</span>
      </div>
      <ul className="metric-list compact-list">
        {metrics.topProducts.length === 0 ? (
          <li className="empty-row">No hay productos con pedidos.</li>
        ) : (
          metrics.topProducts.map((item, index) => (
            <li key={item.name} className="metric-row metric-row--compact">
              <div className="metric-rank">0{index + 1}</div>
              <div className="metric-name-block">
                <strong>{item.name}</strong>
              </div>
              <div className="metric-bar-wrap">
                <div
                  className="metric-bar metric-bar--products"
                  style={{ width: `${(item.count / metrics.maxProductCount) * 100}%` }}
                />
              </div>
              <strong className="metric-number">{item.count}</strong>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  const renderFavoritesPanel = () => (
    <div className="panel-card">
      <div className="panel-card__header">
        <h2>Usuarios con más favoritos</h2>
        <span>{metrics.mostSavedUsers.length} clientes</span>
      </div>
      <ul className="metric-list compact-list">
        {metrics.mostSavedUsers.length === 0 ? (
          <li className="empty-row">No hay favoritos guardados.</li>
        ) : (
          metrics.mostSavedUsers.map((item, index) => (
            <li key={item.uid} className="metric-row metric-row--compact">
              <div className="metric-rank">0{index + 1}</div>
              <div className="metric-name-block">
                <strong>{item.name || "Cliente"}</strong>
              </div>
              <div className="metric-bar-wrap">
                <div
                  className="metric-bar metric-bar--favorites"
                  style={{ width: `${(item.count / metrics.maxFavoriteCount) * 100}%` }}
                />
              </div>
              <strong className="metric-number">{item.count}</strong>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  const renderUserFavorites = () => (
    <div className="panel-card panel-card--wide">
      <div className="panel-card__header">
        <h2>Mis favoritos</h2>
        <span>{metrics.totalFavorites} productos</span>
      </div>
      <ul className="metric-list">
        {visibleFavorites.length === 0 ? (
          <li className="empty-row">Todavía no tienes productos favoritos.</li>
        ) : (
          visibleFavorites.map((favorite, index) => (
            <li key={favorite.id || `${favorite.userId}-${index}`} className="metric-row">
              <div className="metric-rank">0{index + 1}</div>
              <div className="metric-profile">
                <span className="mini-avatar mini-avatar--favorite">♥</span>
                <div>
                  <strong>{favorite.productName || favorite.name || "Producto favorito"}</strong>
                  <small>{favorite.category || "Categoría"}</small>
                </div>
              </div>
              <div className="metric-bar-wrap">
                <div className="metric-bar metric-bar--favorites" style={{ width: "100%" }} />
              </div>
              <strong className="metric-number">Fav</strong>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  const renderUserOrders = () => (
    <div className="panel-card panel-card--wide">
      <div className="panel-card__header">
        <h2>Mis pedidos</h2>
        <span>{metrics.totalOrders} pedidos</span>
      </div>
      <ul className="metric-list">
        {visibleOrders.length === 0 ? (
          <li className="empty-row">Aún no has realizado pedidos.</li>
        ) : (
          visibleOrders.map((order, index) => (
            <li key={order.id || `${order.userId}-${index}`} className="metric-row">
              <div className="metric-rank">0{index + 1}</div>
              <div className="metric-profile">
                <span className="mini-avatar mini-avatar--orders">✓</span>
                <div>
                  <strong>{order.productName || order.productId || "Pedido"}</strong>
                  <small>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Sin fecha"}</small>
                </div>
              </div>
              <div className="metric-bar-wrap">
                <div
                  className="metric-bar metric-bar--orders-user"
                  style={{ width: `${Math.min(100, 35 + index * 12)}%` }}
                />
              </div>
              <strong className="metric-number">{order.amount || "Bs."}</strong>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-loading">Cargando panel...</p>
      </div>
    );
  }

  const pageTitle = isAdmin ? "Panel de clientes y pedidos" : "Mi cuenta";
  const pageSubtitle = isAdmin ? "ADMINISTRACIÓN" : "PERFIL";

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-topbar">
          <div className="admin-nav-group">
            <Link to="/" className="back-home-link">
              Inicio
            </Link>
            <div className="admin-breadcrumb">{isAdmin ? "Admin / Dashboard" : "Mi cuenta / Perfil"}</div>
          </div>
          <div className="admin-filter-group" aria-label="Filtros del dashboard">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`filter-chip ${activeFilter === filter.id ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <header className="admin-header">
          <div>
            <p className="eyebrow admin-eyebrow">{pageSubtitle}</p>
            <h1>{pageTitle}</h1>
          </div>
          {user && (
            <div className="admin-user-badge">
              <span className="admin-avatar">{getInitials(user.name || user.email || "Admin")}</span>
              <span>{user.name || "Usuario"}</span>
            </div>
          )}
        </header>

        {isAdmin && overviewCards.length > 0 && (
          <section className="admin-insights" aria-label="Resumen de ventas y clientes">
            {overviewCards.map((card) => (
              <article key={card.label} className="admin-insight-card">
                <span className="admin-insight-card__label">{card.label}</span>
                <strong className="admin-insight-card__value">{card.value}</strong>
                <small className="admin-insight-card__meta">{card.meta}</small>
              </article>
            ))}
          </section>
        )}

        <section className="stats-grid">
          <article className="stat-card stat-card--users">
            <div className="stat-card__label">{isAdmin ? "Usuarios" : "Favoritos"}</div>
            <div className="stat-card__value">{isAdmin ? metrics.totalUsers : metrics.totalFavorites}</div>
            <div className="stat-card__meta">{isAdmin ? "activos" : "guardados"}</div>
          </article>
          <article className="stat-card stat-card--orders">
            <div className="stat-card__label">{isAdmin ? "Pedidos" : "Pedidos"}</div>
            <div className="stat-card__value">{metrics.totalOrders}</div>
            <div className="stat-card__meta">{isAdmin ? "registrados" : "realizados"}</div>
          </article>
          <article className="stat-card stat-card--favorites">
            <div className="stat-card__label">{isAdmin ? "Favoritos" : "Perfil"}</div>
            <div className="stat-card__value">{isAdmin ? metrics.totalFavorites : "OK"}</div>
            <div className="stat-card__meta">{isAdmin ? "guardados" : "activo"}</div>
          </article>
        </section>

        {isAdmin ? (
          <section className="admin-grid">
            {activeFilter === "overview" && (
              <>
                {renderCustomerPanel()}
                {renderProductsPanel()}
                {renderFavoritesPanel()}
              </>
            )}
            {activeFilter === "customers" && renderCustomerPanel()}
            {activeFilter === "products" && renderProductsPanel()}
            {activeFilter === "favorites" && renderFavoritesPanel()}
          </section>
        ) : (
          <section className="admin-grid user-account-grid">
            {activeFilter === "overview" && (
              <>
                {renderUserFavorites()}
                {renderUserOrders()}
              </>
            )}
            {activeFilter === "favorites" && renderUserFavorites()}
            {activeFilter === "orders" && renderUserOrders()}
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminDashboard;
