use alhogiu;

/* drop table script:
DROP TABLE IF EXISTS user_restrictions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipe;
DROP TABLE IF EXISTS ingredient_restrictions;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS dietary_restrictions;
DROP TABLE IF EXISTS reviews;
*/

/*create table script:*/

CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
    
CREATE TABLE dietary_restrictions(
  dietary_id INT PRIMARY KEY AUTO_INCREMENT,
  dietary_name VARCHAR(50) NOT NULL
);

CREATE TABLE user_restrictions(
  user_id INT NOT NULL,
  dietary_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (dietary_id) REFERENCES dietary_restrictions(dietary_id)
);

CREATE TABLE ingredients(
  ingredient_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL
);

CREATE TABLE ingredient_restrictions(
  ingredient_id INT NOT NULL,
  dietary_id INT NOT NULL,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id),
  FOREIGN KEY (dietary_id) REFERENCES dietary_restrictions(dietary_id)
);

CREATE TABLE `recipes` (
  `recipe_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(50),
  `type` varchar(50),
  `instructions` varchar(5000) DEFAULT NULL,
  `image` varchar(66),
  `video` varchar(50),
  `prep_time` int NOT NULL,
  PRIMARY KEY (`recipe_id`)
);

CREATE TABLE recipe_ingredients(
  recipe_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity FLOAT NOT NULL,
  quantity_type varchar(50),
  required BOOLEAN NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id)
);

CREATE TABLE `substitutes` (
  `substitute_id` int NOT NULL,
  `substitute_name` varchar(50) NOT NULL,
  `ingredient_id`  int NOT NULL,
  `cost` float NOT NULL
);	

CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `recipe_id` int NOT NULL,
  `review_title` varchar(70) NOT NULL,
  `review_score` float NOT NULL,
  `review_content` varchar(300) NOT NULL,
  PRIMARY KEY (`review_id`),
  KEY `user_id` (`user_id`),
  KEY `recipe_id` (`recipe_id`),
  CONSTRAINT `recipe_id` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);

CREATE TABLE `notes` (
  `recipe_id` int NOT NULL,
  `user_id` int NOT NULL,
  `note` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`recipe_id`, `user_id`),
  CONSTRAINT FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`),
  CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);

/*insert data script:*/
INSERT INTO `alhogiu`.`users`
(`first_name`,`last_name`,`email`,`password`)
VALUES
('Ana','Hogiu','alhogiu@uwaterloo.ca','letmecookyay!');



/*modify data script:*/


-- Users Table add health goals and weekly budget
ALTER TABLE users 
ADD COLUMN health_goals TEXT,
ADD COLUMN weekly_budget DECIMAL(10,2);

-- Dietary Preferences Table 
CREATE TABLE dietary_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    preference_name VARCHAR(255) UNIQUE
);

-- User Preferences Table
CREATE TABLE user_preferences (
    user_id INT,
    preference_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (preference_id) REFERENCES dietary_preferences(preference_id),
    PRIMARY KEY (user_id, preference_id)
);

-- User Ingredients Table 
CREATE TABLE user_ingredients (
    user_id INT,
    ingredient_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id),
    PRIMARY KEY (user_id, ingredient_id)
);

-- Adding dietary_preferences options
INSERT INTO dietary_preferences (preference_name) VALUES
('Vegetarian'), 
('Vegan'), 
('Gluten-Free'), 
('Dairy-Free'), 
('High-Protein'), 
('Low-Carb'), 
('None');

ALTER TABLE users DROP COLUMN health_goals;

CREATE TABLE health_goals (
  goal_id INT AUTO_INCREMENT PRIMARY KEY,
  goal_name VARCHAR(255) NOT NULL
);

INSERT INTO health_goals (goal_name) VALUES
  ('Weight Loss'),
  ('Muscle Gain'),
  ('Increase Energy Levels'),
  ('Improve Digestion'),
  ('Lower sugar intake'),
  ('Balanced Nutrition');

CREATE TABLE user_goals (
  user_id INT NOT NULL,
  goal_id INT NOT NULL,
  PRIMARY KEY (user_id, goal_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (goal_id) REFERENCES health_goals(goal_id) ON DELETE CASCADE
);

CREATE TABLE user_tried (
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY (user_id, recipe_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

CREATE TABLE user_favourites (
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY (user_id, recipe_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

ALTER TABLE user_ingredients
ADD COLUMN expiration_date DATE NULL;