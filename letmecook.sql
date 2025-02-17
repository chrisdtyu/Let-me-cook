use alhogiu;

/* drop table script:
DROP TABLE IF EXISTS user_restrictions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipe;
DROP TABLE IF EXISTS ingredient_restrictions;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS dietary_restrictions;
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

CREATE TABLE recipes(
  recipe_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  prep_time INT NOT NULL,
  instructions VARCHAR(2000)
);

CREATE TABLE recipe_ingredients(
  recipe_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity FLOAT NOT NULL,
  required BOOLEAN NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id)
);

/*insert data script:*/
INSERT INTO `alhogiu`.`users`
(`first_name`,`last_name`,`email`,`password`)
VALUES
('Ana','Hogiu','alhogiu@uwaterloo.ca','letmecookyay!');



/*modify data script:*/
