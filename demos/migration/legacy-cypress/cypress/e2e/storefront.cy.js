describe('legacy storefront coverage', () => {
  it('MIG-001 displays the product catalog', () => {
    cy.visit('/');
    cy.get('#products article').should('have.length', 2);
  });

  it('MIG-002 completes checkout after a network alias', () => {
    cy.intercept('POST', '/api/orders').as('createOrder');
    cy.visit('/');
    cy.contains('button', 'Buy now').first().click();
    cy.wait('@createOrder');
    cy.contains('Order confirmed').should('be.visible');
  });

  it('MIG-003 validates the products API', () => {
    cy.request('/api/products').its('body.products').should('have.length', 2);
  });
});
