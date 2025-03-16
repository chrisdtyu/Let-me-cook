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
  });
  