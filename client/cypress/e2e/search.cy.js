describe('Recipe Search Page', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/api/getIngredients*', {
            statusCode: 200,
            body: ['chicken', 'onion', 'garlic'],
        }).as('getIngredients');

        cy.intercept('GET', '**/api/getCuisines*', {
            statusCode: 200,
            body: ['Italian', 'Mexican', 'Thai'],
        }).as('getCuisines');

        cy.intercept('GET', '**/api/getCategories*', {
            statusCode: 200,
            body: ['Dinner', 'Lunch', 'Dessert'],
        }).as('getCategories');

        cy.intercept('POST', '/api/getUser', {
            statusCode: 200,
            body: { express: JSON.stringify({ user_id: 'guest' }) },
        }).as('getUser');

        // Only visit after all intercepts are in place
        cy.visit('http://localhost:3000/search');
    });

    it('allows user to add ingredient, cuisine, and category, and search for recipes', () => {
        cy.wait('@getIngredients');
        cy.wait('@getCuisines');
        cy.wait('@getCategories');

        // Enter a manual ingredient
        cy.get('[data-cy="manual-ingredient-input"]').type('chicken');
        cy.contains('Add').click();

        cy.get('.MuiChip-root').contains('chicken');

        cy.get('[data-cy="cuisines-autocomplete"]').click().type('Italian');
        cy.get('ul[role="listbox"] li').contains('Italian').should('be.visible').click();

        // Select category
        cy.get('[data-cy="categories-autocomplete"]').click().type('Dinner');
        cy.get('ul[role="listbox"] li').contains('Dinner').should('be.visible').click();

        cy.intercept('POST', '**/api/recommendRecipes', (req) => {
            expect(req.body).to.include({
                userId: null,
                budgetMode: false,
            });

            expect(req.body.ingredients).to.include('chicken');
            expect(req.body.cuisines).to.include('Italian');
            expect(req.body.categories).to.include('Dinner');

            req.reply({
                statusCode: 200,
                body: [
                    {
                        recipe_id: 42,
                        name: 'Quick Italian Chicken',
                        type: 'Italian',
                        category: 'Dinner',
                        prep_time: 25,
                        instructions: 'Cook chicken with garlic...',
                        image: 'some-image.jpg',
                        recipe_ingredients: 'chicken,garlic',
                        ingredient_prices: '2.50,0.50',
                        total_ingredients: 2,
                        missing_ingredients: 0,
                        average_rating: 4.5,
                        ingredients: [
                            { name: 'chicken', price: 2.5 },
                            { name: 'garlic', price: 0.5 }
                        ],
                        missingIngredients: [],
                        estimated_cost: 3.0,
                        goal: 'High Protein'
                    },
                    {
                        recipe_id: 43,
                        name: 'Classic Chicken Alfredo',
                        type: 'Italian',
                        category: 'Dinner',
                        prep_time: 35,
                        instructions: 'Boil pasta and cook chicken in Alfredo sauce...',
                        image: 'alfredo.jpg',
                        recipe_ingredients: 'chicken,cream,onion',
                        ingredient_prices: '2.50,1.20,0.30',
                        total_ingredients: 3,
                        missing_ingredients: 1,
                        average_rating: 4.7,
                        ingredients: [
                            { name: 'chicken', price: 2.5 },
                            { name: 'onion', price: 0.3 }
                        ],
                        missingIngredients: [
                            { name: 'cream', price: 1.2 }
                        ],
                        estimated_cost: 4.0,
                        goal: 'Comfort Food'
                    }
                ]
            });
        }).as('recommendRecipes');

        // Click search button
        cy.contains('🔍 Find Recipes').click();
        cy.wait('@recommendRecipes');
        cy.contains('Quick Italian Chicken').should('be.visible');

        // cy.get('[data-cy="sort-select"]').click();
        // cy.get('ul[role="listbox"]').contains('Preparation Time').click();
        cy.get('[data-cy="spinner"]').should('not.exist');

        // Confirm sorting applied
        cy.get('[data-cy="recipe-card"]').first().should('contain.text', 'Quick Italian Chicken');
        cy.get('[data-cy="recipe-card"]').eq(1).should('contain.text', 'Classic Chicken Alfredo');

        // Spinner appears or results
        cy.get('body').then(($body) => {
            if ($body.find('.MuiCircularProgress-root').length) {
                // Wait for loading to disappear
                cy.get('.MuiCircularProgress-root').should('not.exist');
                cy.get('h6').should('not.contain', 'No recipes found');
            } else {
                // Confirm results or a fallback
                cy.get('h6').should('not.contain', 'No recipes found');
            }
        });
    });
});
