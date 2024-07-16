const apiUrl = 'https://www.thecocktaildb.com:3000/api/json/v1/1/filter.php?i='; // Assign a variable to API link with port

// Assign variable names to HTML elements
const searchBox = document.querySelector('#searchbx');
const searchBtn = document.querySelector('#searchbtn');
const cocktailList = document.querySelector('.cocktailList');
const recipeDiv = document.querySelector('.recipediv');
let ingredients = '';

// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
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
            cocktailList.appendChild(listItem); // Append the list item to the cocktail list that is already an element in HTML
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
                                    <li>${drink.strIngredient1 || ''}</li>
                                    <li>${drink.strIngredient2 || ''}</li>
                                    <li>${drink.strIngredient3 || ''}</li>
                                    <li>${drink.strIngredient4 || ''}</li>
                                </ul>
                                <h3>Instructions:</h3>
                                <p>${drink.strInstructions}</p>
                                <div class="likeSect">
                                    <p id="likes">0</p>
                                    <button class="Likebutton">Like</button>
                                </div>
                                <h3>Comments:</h3>
                                <input type="text" id="commentInput" placeholder="Enter your comment">
                                <button class="CommentButton">Add Comment</button>
                                <ol id="commentList"></ol>
                            </div>
                        </div>
                    </div>`;
                // Add event listeners for the Like button and Add Comment button
                document.querySelector('.Likebutton').addEventListener('click', likeAdder);
                document.querySelector('.CommentButton').addEventListener('click', addComment);
            });
    }

    // Function to increase likes when the Like button is clicked
    function likeAdder() {
        const likes = document.getElementById('likes');
        let value = parseInt(likes.innerHTML);
        ++value;
        likes.innerHTML = value;
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
});
