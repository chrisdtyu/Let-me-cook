describe('Show Recipe details', () => {
    it('shows one recipe from the server', () => {
        cy.intercept('GET', 'http://localhost:3000/api/getRecipe?id=1', {
            "recipe_id": 1,
            "name": "Integration Test Recipe 1",
            "category": "Dessert",
            "type": "British",
            "instructions": "this is a test",
            "image": "https://www.themealdb.com/images/media/meals/wxywrq1468235067.jpg",
            "video": "https://www.youtube.com/embed/zXbzY7p0h-4",
            "prep_time": 55
          });
        cy.visit('http://localhost:3000/Recipe/1');
        cy.contains("this is a test");
        cy.contains("Integration");
    });
});
