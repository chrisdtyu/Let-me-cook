import fs from 'fs/promises';

let recipeFiles = [
    "recipes-a.json",
    "recipes-b.json",
    "recipes-c.json",
    "recipes-d.json",
    "recipes-e.json",
    "recipes-f.json",
    "recipes-g.json",
    "recipes-h.json",
    "recipes-i.json",
    "recipes-j.json",
    "recipes-k.json",
    "recipes-l.json",
    "recipes-m.json",
    "recipes-n.json",
    "recipes-o.json",
    "recipes-p.json",
    "recipes-r.json",
    "recipes-s.json",
    "recipes-t.json",
    "recipes-v.json",
    "recipes-w.json",
    "recipes-y.json"
];

async function loadFile(filename) {
    let data = await fs.readFile(filename, 'utf8');
    let jsonData = JSON.parse(data);
    return jsonData;
}

async function writeCsv(header, data, filename) {
    await fs.writeFile(filename, header + "\n" + data, 'utf8');
}

async function convertRecipes() {
    let header = "id,name,category,cuisineType,instructions,image,video";
    let data = ""
    let id = 0;
    for (let recipeFile of recipeFiles) {
        let recipes = await loadFile("./data-mealdb/input/" + recipeFile);
        data = data + recipes.meals.map(r => {
            id++;
            let instructions = r.strInstructions.replaceAll("\r\n", "");
            instructions = instructions.replaceAll('"', '');
            return `${id},"${r.strMeal}","${r.strCategory ?? ''}","${r.strArea ?? ''}","${instructions ?? ''}","${r.strMealThumb ?? ''}","${r.strYoutube ?? ''}"`
        }).join("\n") + "\n";
    }
    await writeCsv(header, data, "./data-mealdb/output/recipes.csv");
}

async function convertIngredients() {
    let ingredients = await loadFile("./data-mealdb/input/ingredients.json");
    let header = "id,name,type";
    let data = ingredients.meals.map(i => `${i.idIngredient},"${i.strIngredient}","${i.strType ?? ''}"`).join("\n");
    await writeCsv(header, data, "./data-mealdb/output/ingredients.csv");
}

async function convertRecipeIngredients() {
    let header = "recipeId,ingredientId,quantity";
    let ingredients = await loadFile("./data-mealdb/input/ingredients.json");
    let allRecipes = [];
    for (let recipeFile of recipeFiles) {
        let recipes = await loadFile("./data-mealdb/input/" + recipeFile);
        allRecipes = allRecipes.concat(recipes.meals);
    }
    let data = [];
    let id = 0;
    for (let recipe of allRecipes) {
        id++;
        for (let i = 1; i < 21; i++) {
            let ingredient = recipe[`strIngredient${i}`];
            let quantity = recipe[`strMeasure${i}`];
            if (ingredient) {
                let ingredientId = ingredients.meals.find(ing => ing.strIngredient.toLowerCase() == ingredient.toLowerCase());
                if (ingredientId) {
                    data.push(`${id},${ingredientId ? ingredientId.idIngredient : ""},${quantity}`);
                } else {
                    console.error(`Ingredient not found: '${ingredient}' '${recipe.strMeal}'`);
                }
            }
        }
    }
    let dataString = data.join("\n");
    await writeCsv(header, dataString, "./data-mealdb/output/recipe-ingredients.csv");
}

convertIngredients();
convertRecipes();
convertRecipeIngredients();