describe('Profile Page', () => {
  beforeEach(() => {
      cy.visit('http://localhost:3000'); 
      cy.window().then((win) => {
          win.localStorage.setItem('firebase_uid', 'dummy_uid');
      });

      cy.intercept('POST', '/api/getUser', {
          statusCode: 200,
          body: {
              express: JSON.stringify({
                  user_id: 1,
                  first_name: "Test",
                  last_name: "User",
                  email: "test@example.com"
              })
          }
      }).as('getUser');

      cy.intercept('POST', '/api/getUserProfile', {
          statusCode: 200,
          body: {
              user: { weekly_budget: "100" },
              dietaryPreferences: [1],
              dietaryRestrictions: [{ dietary_id: 2 }],
              alwaysAvailable: [{ ingredient_id: 3 }]
          }
      }).as('getUserProfile');

      cy.intercept('GET', '/api/getDietaryPreferences', {
          statusCode: 200,
          body: [{ preference_id: 1, preference_name: "Vegetarian" }]
      }).as('getDietaryPreferences');

      cy.intercept('GET', '/api/getDietaryRestrictions', {
          statusCode: 200,
          body: [{ dietary_id: 2, dietary_name: "Gluten-Free" }]
      }).as('getDietaryRestrictions');

      cy.intercept('GET', '/api/getIngredients', {
          statusCode: 200,
          body: [{ ingredient_id: 3, name: "Tomato", type: "Vegetable" }]
      }).as('getIngredients');

      cy.intercept('POST', '/api/getUserRecipes', {
          statusCode: 200,
          body: {
              tried: [{ recipe_id: 1, name: "Tomato Soup" }],
              favourites: [{ recipe_id: 2, name: "Vegetable Stir-fry" }]
          }
      }).as('getUserRecipes');
  });

  it('displays the user profile information', () => {
      cy.visit('http://localhost:3000/Profile');
      cy.contains(/user profile/i).should('exist');
      cy.get('input[readonly]').should('have.length', 3); 
      cy.contains(/weekly budget/i).should('exist');
  });

  it('updates the profile when Update Profile is clicked', () => {
      cy.intercept('POST', '/api/saveProfile', {
          statusCode: 200,
          body: { message: "Profile saved successfully!" }
      }).as('saveProfile');

      cy.visit('http://localhost:3000/Profile');
      cy.wait(['@getUser', '@getUserProfile']);
      cy.get('button').contains(/update profile/i).click();
      cy.wait('@saveProfile');
      cy.window().then((win) => {
          cy.stub(win, 'alert').as('alertStub');
      });

      cy.get('button').contains(/update profile/i).click();
      cy.get('@alertStub').should('have.been.calledWith', 'Profile updated successfully!');
  });

  it('displays the tried recipes from profile information', () => {
    cy.visit('http://localhost:3000/Profile');
    cy.wait(['@getUser', '@getUserProfile', '@getUserRecipes']);
    cy.contains('Tried Recipes').should('exist');
    cy.contains('Tomato Soup').should('exist');
  });

  it('displays the favourite recipes and navigates on click', () => {  
    // Wait for API calls to finish
    cy.visit('http://localhost:3000/Profile');
    cy.wait(['@getUser', '@getUserProfile', '@getUserRecipes']);
  
    // Check that the "Favourite Recipes" section is displayed
    cy.contains('Favourite Recipes').should('exist');
    cy.contains('Vegetable Stir-fry').should('exist');
  
    // Simulate a click on the "Vegetable Stir-fry" link
    cy.contains('Vegetable Stir-fry')
      .click()
      .should('have.attr', 'href', '/Recipe/2'); // Check the href attribute of the <a> tag
  
    // Assert that the URL has changed (this simulates the navigation)
    cy.url().should('include', '/Recipe/2');
  });
});
