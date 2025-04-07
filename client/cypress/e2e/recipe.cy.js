describe('Show Recipe details', () => {
    it('shows one recipe from the server', () => {
        cy.intercept('GET', '**/api/getRecipe*', {
            statusCode: 200,
            body: {
                recipe_id: 1,
                name: "Integration Test Recipe 1",
                category: "Dessert",
                type: "British",
                instructions: "this is a test. Step two here.",
                image: "https://www.themealdb.com/images/media/meals/wxywrq1468235067.jpg",
                video: "https://www.youtube.com/embed/zXbzY7p0h-4",
                prep_time: 55,
                user_id: 1,
                goals: ["Low Sugar"],
                estimated_cost: 3.99
            }
        }).as('getRecipe');

        cy.visit('http://localhost:3000/Recipe/1');
        cy.wait('@getRecipe');
        cy.contains("Integration Test Recipe 1");
        cy.contains("this is a test");
        cy.contains("Step two here");
        cy.contains("Category: Dessert");
        cy.contains("Time: 55 mins");
        cy.contains("Target Goal")
    });

    it('opens review form, shows errors, and submits review', () => {
        cy.intercept('POST', '/api/getUser', {
            statusCode: 200,
            body: { express: JSON.stringify({ user_id: 123 }) }
          }).as('getUser');

        cy.intercept('POST', '/api/addReview', {
            statusCode: 200,
            body: { success: true },
        }).as('addReview');
          
        cy.intercept('GET', '/api/getReviews*', {
            statusCode: 200,
            body: {
                express: JSON.stringify([
                    {
                        review_id: 1,
                        review_title: 'Awesome Dinner',
                        review_content: 'This was absolutely delicious!',
                        review_score: 4,
                        user_id: 123
                    }
                ])
            }
        }).as('getReviews');

        // Required if the form fetches user details via firebase_uid
        localStorage.setItem('firebase_uid', 'mock-uid');

        cy.visit('http://localhost:3000/Recipe/1');

        cy.contains("Leave a Review").click();

        cy.contains("Review This Recipe").should('exist');
        cy.get('textarea').should('exist');
        cy.get('#submit-button').should('exist');


        cy.contains("Submit").click();
        // gives error messages if fields are not filled out
        cy.contains("Enter your review title")
        cy.contains("Select the rating")
        // fill in the fields
        cy.get('#review-title').type('Awesome Dinner'); // assuming you gave title input an id
        cy.get('#review-body').type('This was absolutely delicious!'); // your textarea ID
        cy.get('input[name="radio-buttons-group"][value="4"]').check({ force: true });

        // submits once all fields are completed
        cy.contains("Submit").click();
        cy.wait('@addReview'); 
        cy.contains("Your review has been received!").should('exist');
    });
});
