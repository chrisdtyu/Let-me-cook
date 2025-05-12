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
- **Expiration Tracking**: Users can add expiration dates to their always-available ingredients and receive alerts when ingredients are nearing expiration.
- **Budget Management**: A weekly budget tracker helps users stay on track by monitoring total weekly spending and notifying them when they are nearing their limit.
- **Nutritional Considerations**: Users can filter recipes based on their dietary preferences and nutritional goals.
- **Interactive Features**: Users can engage with existing recipes, leave comments, and add their own recipes.
- **Scalability**: The ability to adjust recipes based on ingredient availability.
- **Recipe Tracking**: Users can mark recipes as "Tried" and save favorites, which appear on their profile for easy access.
- **Help Icons**: Helpful tooltips are available throughout the app via help icons to assist users in understanding features and making the most of the platform.

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chrisdtyu/Let-me-cook.git
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

3. **Start the development server**:
   ```bash
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### ⚠️ Note

>  Some features require a MySQL database that was hosted on a university server. That database is no longer active.
> **To view the full functionality, [watch the demo video here](https://www.youtube.com/watch?v=DkWWEJSygE4).**



## Usage

1. **Register/Login**: Create an account or log in to access personalized features.
2. **Add Ingredients**: Input the ingredients you have on hand.
3. **Find Recipes**: Browse recipes that match your available ingredients.
4. **Save Favorites**: Save recipes you like for easy access later.
5. **Adjust Recipe Quantities**: Scale recipes to fit the amount of ingredients you have.
6. **Interact with Recipes**: Leave comments, share, or add your own recipes.

## Sample Data

To explore the app's features, you can test the search functionality by entering any ingredient or keyword. 

For login testing, you can either **sign up for a new account** or use the following sample credentials:

- **Email:** `sampleemail@uwaterloo.ca`  
- **Password:** `SamplePassword123@`  

After logging in, you will be redirected to the **profile page**, where you can customize your user profile and save it to the database.

## Authors
Shresta Gourishetty, Ana Hogiu, Muhammad Hussain, Christopher Yu
