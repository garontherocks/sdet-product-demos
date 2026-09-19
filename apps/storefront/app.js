const response = await fetch('/api/products');
const { products } = await response.json();
const container = document.querySelector('#products');
const renderDelay = new URLSearchParams(window.location.search).get('renderDelay');
if (renderDelay) await new Promise((resolve) => setTimeout(resolve, Number(renderDelay)));
for (const product of products) {
  const card = document.createElement('article');
  card.innerHTML = `<h3>${product.name}</h3><p>$${product.price}</p><button data-product="${product.id}">Buy now</button>`;
  container.append(card);
}
container.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.product);
  const order = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ productId: product.id, total: product.price }),
  }).then((result) => result.json());
  document.querySelector('#order-id').textContent = order.id;
  document.querySelector('#order-total').textContent = `$${order.total}`;
  document.querySelector('#receipt').hidden = false;
});
