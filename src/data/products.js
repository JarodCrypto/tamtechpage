export const products = [
  { id: "1", image: "/productostamtech/producto1.webp", name: "Cortador de galletas 1", category: "Cortadores de galletas", price: 35, featured: true },
  { id: "2", image: "/productostamtech/producto2.webp", name: "Cortador de galletas 2", category: "Cortadores de galletas", price: 45 },
  { id: "3", image: "/productostamtech/producto3.webp", name: "Cortador de galletas 3", category: "Cortadores de galletas", price: 30 },
  { id: "4", image: "/productostamtech/producto4.webp", name: "Cortador de galletas 4", category: "Cortadores de galletas", price: 60 },
  { id: "5", image: "/productostamtech/producto5.webp", name: "Cortador de galletas 5", category: "Cortadores de galletas", price: 40 },
  { id: "6", image: "/productostamtech/producto6.webp", name: "Cortador de galletas 6", category: "Cortadores de galletas", price: 55 },
  { id: "7", image: "/productostamtech/producto7.webp", name: "Cortador de galletas 7", category: "Cortadores de galletas", price: 25 },
  { id: "8", image: "/productostamtech/producto8.webp", name: "Cortador de galletas 8", category: "Cortadores de galletas", price: 50 },
  { id: "9", image: "/productostamtech/producto9.webp", name: "Cortador de galletas 9", category: "Cortadores de galletas", price: 65 },
  { id: "10", image: "/productostamtech/producto10.webp", name: "Cortador de galletas 10", category: "Cortadores de galletas", price: 35 },
];

export function getWhatsAppLink(product, quantity) {
  const productUrl = `${window.location.origin}/producto/${product.id}`;
  const imageUrl = `${window.location.origin}${product.image}`;
  const total = product.price * quantity;
  const message = [
    "Hola TAMTECH, quiero hacer un pedido:",
    "",
    `Producto: ${product.name}`,
    `Categoría: ${product.category}`,
    `Cantidad: ${quantity}`,
    `Precio unitario: Bs. ${product.price}`,
    `Total estimado: Bs. ${total}`,
    "",
    `Ver producto: ${productUrl}`,
    `Imagen: ${imageUrl}`,
  ].join("\n");

  return `https://wa.me/59163197049?text=${encodeURIComponent(message)}`;
}
