# LetMeCook

LetMeCook is a web application designed to assist university students and other individuals with meal planning and cooking by suggesting recipes based on the ingredients they have available. The app aims to make meal preparation easy, budget-friendly, and health-conscious by offering personalized recommendations based on user preferences, dietary restrictions, and budget constraints.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Sample Data](#sample-data)

## Features

- **Ingredient-Based Recipe Search**: Input your available ingredients to find matching recipes.
- **Personalized Recommendations**: Recipes are tailored based on user preferences, dietary restrictions, and budget constraints.
- **Budget-Friendly Suggestions**: The app suggests affordable recipes and ingredient substitutes.
- **Nutritional Considerations**: Users can filter recipes based on their dietary preferences and nutritional goals.
- **Interactive Features**: Users can engage with existing recipes, leave comments, and add their own recipes.
- **Scalability**: The ability to adjust recipes based on ingredient availability.
- **Chatbot Assistance**: A chatbot feature allows users to ask questions about recipes and further tailor their preferences.

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MSci-245-react/team-project-team-11-1.git
   cd team-project-team-11-1
   ```

2. **Install dependencies**:
   Ensure you have [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed. Then, run:
   ```bash
   yarn install
   cd client
   yarn install
   cd ..
   ```

3. **Set up Firebase??? (idk maybe we can just give them access)**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Add a web app to your Firebase project to obtain your Firebase configuration.
   - Create a `.env` file in the root directory and add your Firebase configuration:
     ```
     REACT_APP_FIREBASE_API_KEY=your_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=your_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID=your_app_id
     REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```

4. **Start the development server**:
   ```bash
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Usage

1. **Register/Login**: Create an account or log in to access personalized features.
2. **Add Ingredients**: Input the ingredients you have on hand.
3. **Find Recipes**: Browse recipes that match your available ingredients.
4. **Save Favorites**: Save recipes you like for easy access later.
5. **Adjust Recipe Quantities**: Scale recipes to fit the amount of ingredients you have.
6. **Interact with Recipes**: Leave comments, share, or add your own recipes.

## Sample Data

To test the application, you can use the following sample data:

- **User Login**:
  ```json
  
  ```

- **Profile**:
  ```json
  
  ```
  
- **Search**:
  ```json
  
  ```
