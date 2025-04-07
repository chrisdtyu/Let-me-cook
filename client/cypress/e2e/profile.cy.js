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
        alwaysAvailable: [
          { ingredient_name: "Tomato", expirationDate: "" }
        ],
        healthGoals: []
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
      body: [{ ingredient_id: 3, name: "Tomato", type: "Vegetable", price: null }]
    }).as('getIngredients');

    cy.intercept('GET', '/api/getHealthGoals', {
      statusCode: 200,
      body: []
    }).as('getHealthGoals');

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
    cy.wait(['@getUser', '@getUserProfile', '@getDietaryPreferences', '@getDietaryRestrictions', '@getIngredients', '@getHealthGoals', '@getUserRecipes']);

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub');
    });

    cy.get('button').contains(/update profile/i).click();
    cy.wait('@saveProfile');
    cy.get('@alertStub').should('have.been.calledWith', 'Profile updated successfully!');
  });

  it('displays the tried recipes from profile information', () => {
    cy.visit('http://localhost:3000/Profile');
    cy.wait(['@getUser', '@getUserProfile', '@getDietaryPreferences', '@getDietaryRestrictions', '@getIngredients', '@getHealthGoals', '@getUserRecipes']);

    cy.contains('Tried Recipes').should('exist');
    cy.contains('Tomato Soup').should('exist');
  });

  it('displays the favourite recipes and navigates on click', () => {
    cy.visit('http://localhost:3000/Profile');
    cy.wait(['@getUser', '@getUserProfile', '@getDietaryPreferences', '@getDietaryRestrictions', '@getIngredients', '@getHealthGoals', '@getUserRecipes']);

    cy.contains('Favourite Recipes').should('exist');
    cy.contains('Vegetable Stir-fry').should('exist');

    cy.contains('Vegetable Stir-fry').should('have.attr', 'href', '/Recipe/2');

    cy.contains('Vegetable Stir-fry').click();

    cy.url().should('include', '/Recipe/2');
  });
});
