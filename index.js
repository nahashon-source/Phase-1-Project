const apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?i='; // Assign a variable to API link
// Assign variable names to HTML elements
const searchBox = document.querySelector('#searchbx');
const searchBtn = document.querySelector('#searchbtn');
const cocktailList = document.querySelector('.cocktailList');
const recipeDiv = document.querySelector('.recipediv');
const savedRecipesUl = document.querySelector('#recipesUl');
const createRecipeForm = document.querySelector('#recipeForm');
const showSavedRecipesBtn = document.querySelector('#showSavedRecipes');
const showCreateRecipeBtn = document.querySelector('#showCreateRecipe');
const searchListSection = document.querySelector('#searchList');
const recipesListSection = document.querySelector('#recipesList');
const createRecipeSection = document.querySelector('#createRecipe');

let ingredients = '';
let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];

// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to navigation buttons
    showSavedRecipesBtn.addEventListener('click', () => {
        showSection(recipesListSection);
        renderSavedRecipes();
    });

    showCreateRecipeBtn.addEventListener('click', () => {
        showSection(createRecipeSection);
    });

    // Add an event listener to the search button
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        ingredients = searchBox.value; // Get the search input value
        const searchurl = `${apiUrl}${ingredients}`;
        // Fetch data from the API
        fetch(searchurl)
            .then(res => res.json()) // Convert data into JSON format
            .then(data => showCocktailList(data.drinks)); // Call the showCocktailList function with the fetched data
    });

    // Function to display a list of cocktails
    function showCocktailList(drinks) {
        cocktailList.innerHTML = ''; // Clear previous content before adding new items
        const limitedDrinks = drinks.slice(0, 40); // Limit the number of drinks to 40
        limitedDrinks.forEach(drink => {
            const listItem = document.createElement('li'); // Create a new list item element
            listItem.className = 'list-item'; // Add a class name for styling
            listItem.textContent = drink.strDrink; // Set the text content to the cocktail name
            cocktailList.appendChild(listItem); // Append the list item to the cocktail list
            listItem.addEventListener('click', () => {
                cocktailRecipe(drink.idDrink); // Add an event listener to show recipe details when clicked
            });
        });
    }

    // Function to display cocktail recipe details
    function cocktailRecipe(drinkId) {
        const recipeapi = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`;
        fetch(recipeapi)
            .then(res => res.json())
            .then(data => {
                const drink = data.drinks[0]; // Get the first drink from the API
                // Update the recipeDiv with HTML content including drink details
                recipeDiv.innerHTML = `
                    <div class="cardingDiv">
                        <div class="card-ovly"></div>
                        <div class="card-in">
                            <div>
                                <h2>${drink.strDrink}</h2>
                                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="recipeimage">
                            </div>
                            <div id="wordingDiv">
                                <h4>Ingredients:</h4>
                                <ul>
                                    <li>${drink.strIngredient1}</li>
                                    <li>${drink.strIngredient2}</li>
                                    <li>${drink.strIngredient3}</li>
                                    <li>${drink.strIngredient4}</li>
                                </ul>
                                <h3>Instructions:</h3>
                                <p>${drink.strInstructions}</p>
                                <div class="likeSect">
                                    <p id="likes">${drink.likes || 0}</p>
                                    <button class="Likebutton" onclick="likeAdder()">Like</button>
                                </div>
                                <h3>Comments:</h3>
                                <input type="text" id="commentInput" placeholder="Enter your comment">
                                <button class="CommentButton">Add Comment</button>
                                <ol id="commentList">
                                    ${drink.comments ? drink.comments.map(comment => `<li>${comment.text}</li>`).join('') : ''}
                                </ol>
                            </div>
                        </div>
                    </div>`;
                // Add event listeners for the Like button and Add Comment button
                document.querySelector('.Likebutton').addEventListener('click', () => {
                    likeAdder();
                });
                document.querySelector('.CommentButton').addEventListener('click', () => {
                    addComment();
                });
            });
    }

    // Function to increase likes when the Like button is clicked
    function likeAdder() {
        let likes = document.getElementById('likes');
        let value = parseInt(likes.innerHTML);
        ++value;
        document.getElementById("likes").innerHTML = value;
    }

    // Function to add comments when the Add Comment button is clicked
    function addComment() {
        const commentInput = document.getElementById('commentInput');
        const commentList = document.getElementById('commentList');
        const commentText = commentInput.value;

        if (commentText) {
            const commentItem = document.createElement('li');
            commentItem.textContent = commentText;
            commentList.appendChild(commentItem);
            commentInput.value = ''; // Clear the input field after adding the comment
        }
    }

    // Function to show a specific section and hide others
    function showSection(section) {
        searchListSection.style.display = 'none';
        recipesListSection.style.display = 'none';
        createRecipeSection.style.display = 'none';
        section.style.display = 'block';
    }

    // Function to render saved recipes
    function renderSavedRecipes() {
        savedRecipesUl.innerHTML = ''; // Clear previous content before adding new items
        savedRecipes.forEach((recipe, index) => {
            const listItem = document.createElement('li'); // Create a new list item element
            listItem.className = 'list-item'; // Add a class name for styling
            listItem.innerHTML = `
                <h3>${recipe.name}</h3>
                <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                <button class="delete-recipe" data-index="${index}">Delete</button>
            `; // Set the text content to the recipe details
            savedRecipesUl.appendChild(listItem); // Append the list item to the recipes list

            // Add event listener for the delete button
            listItem.querySelector('.delete-recipe').addEventListener('click', (e) => {
                const recipeIndex = e.target.getAttribute('data-index');
                savedRecipes.splice(recipeIndex, 1);
                localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
                renderSavedRecipes(); // Re-render the saved recipes
            });
        });
    }

    // Function to handle the submission of a new recipe
    function addNewRecipeToDB(recipe) {
        fetch('http://localhost:3000/cocktails', { // Update URL to match your server endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        })
        .then(response => response.json())
        .then(data => {
            console.log('New recipe added:', data);
            // Optionally, re-fetch and render the updated list of recipes
            renderSavedRecipes(); 
        })
        .catch(error => {
            console.error('Error adding new recipe:', error);
        });
    }

    // Add event listener for the create recipe form
    createRecipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const recipeName = document.getElementById('recipeName').value;
        const recipeIngredients = document.getElementById('recipeIngredients').value;
        const recipeInstructions = document.getElementById('recipeInstructions').value;

        const newRecipe = {
            name: recipeName,
            ingredients: recipeIngredients.split(',').map(ingredient => ingredient.trim()), // Assuming ingredients are comma-separated
            instructions: recipeInstructions,
            likes: 0, // Initialize likes
            comments: [] // Initialize comments
        };

        // Save new recipe to local storage (if needed) and update db.json
        savedRecipes.push(newRecipe);
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));

        // Send the new recipe to the server
        addNewRecipeToDB(newRecipe);

        // Reset form and show the recipes list section
        createRecipeForm.reset();
        showSection(recipesListSection);
        renderSavedRecipes();
    });

    likeAdder(); // Call the likeAdder function to initialize the like counter
});
