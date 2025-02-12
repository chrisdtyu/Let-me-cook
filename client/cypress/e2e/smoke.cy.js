describe('empty spec', () => {
  it('can view the home page', () => {
    cy.visit('http://localhost:3000/');
    cy.contains('Review a movie');
  });
});