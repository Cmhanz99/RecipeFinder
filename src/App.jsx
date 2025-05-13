import React, { useState, useEffect } from 'react';
import "./App.css";

function App() {
  const [food, setFood] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  
  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem('recipeFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);
  
  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Search for recipes
  function fetchRecipes() {
    if (!food.trim()) return; // Prevent empty searches
    
    setIsLoading(true);
    
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${food}`)
      .then((response) => response.json())
      .then((data) => {
        setRecipes(data.meals || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log('Error fetching recipes:', error);
        setIsLoading(false);
      });
  }

  // Get random recipe
  function getRandomRecipe() {
    setIsLoading(true);
    
    fetch('https://www.themealdb.com/api/json/v1/1/random.php')
      .then((response) => response.json())
      .then((data) => {
        setRecipes(data.meals || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log('Error fetching random recipe:', error);
        setIsLoading(false);
      });
  }

  // Handle Enter key press in search input
  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      fetchRecipes();
    }
  }

  // Show recipe modal
  function viewRecipe(recipe) {
    setSelectedRecipe(recipe);
    setShowModal(true);
  }

  // Close modal
  function closeModal() {
    setShowModal(false);
  }

  // Add or remove from favorites
  function toggleFavorite(recipe) {
    const isFavorite = favorites.some(fav => fav.idMeal === recipe.idMeal);
    
    if (isFavorite) {
      // Remove from favorites
      setFavorites(favorites.filter(fav => fav.idMeal !== recipe.idMeal));
    } else {
      // Add to favorites
      setFavorites([...favorites, recipe]);
    }
  }

  // Check if recipe is in favorites
  function isFavorite(recipeId) {
    return favorites.some(fav => fav.idMeal === recipeId);
  }

  // Find a favorite recipe by ID
  function findFavorite(recipeId) {
    return favorites.find(fav => fav.idMeal === recipeId);
  }

  // Load a favorite recipe
  function loadFavorite(recipeId) {
    const recipe = findFavorite(recipeId);
    if (recipe) {
      setRecipes([recipe]);
    }
  }

  // Get recipe ingredients
  function getIngredients(recipe) {
    if (!recipe) return [];
    
    let ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push(`${ingredient} - ${measure}`);
      }
    }
    return ingredients;
  }

  return (
    <div className='main_app'>
      <h1>🍳 Recipe Finder</h1>

      {/* Search Bar */}
      <div className="header_input">
        <input 
          type="text" 
          value={food}
          onChange={(e) => setFood(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Enter food name (e.g. pasta, chicken)..." 
        />
        <button className='search_btn' onClick={fetchRecipes}>Search</button>
      </div>

      {/* Feature Buttons */}
      <div className="feature-buttons">
        <button className="random-btn" onClick={getRandomRecipe}>
          Get Random Recipe
        </button>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="favorites">
          <h3>Your Favorite Recipes:</h3>
          <div className="favorites-list">
            {favorites.map(favorite => (
              <div key={favorite.idMeal} className="favorite-item">
                <span onClick={() => loadFavorite(favorite.idMeal)}>
                  {favorite.strMeal}
                </span>
                <button 
                  className="remove-btn" 
                  onClick={() => toggleFavorite(favorite)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading">
          Loading recipes...
        </div>
      )}

      {/* Recipe List */}
      <div className="list_recipe">
        {!isLoading && recipes && recipes.length > 0 ? (
          <ul>
            {recipes.map((recipe) => (
              <li key={recipe.idMeal}>
                <button 
                  className="favorite-btn" 
                  onClick={() => toggleFavorite(recipe)}
                  title={isFavorite(recipe.idMeal) ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite(recipe.idMeal) ? "❤️" : "🤍"}
                </button>
                <h2>{recipe.strMeal}</h2>
                <img
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  onClick={() => viewRecipe(recipe)}
                />
                <button 
                  className="view-btn"
                  onClick={() => viewRecipe(recipe)}
                >
                  View Recipe
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !isLoading && (
            <p className="no-results">
              {recipes && recipes.length === 0 
                ? "No recipes found. Try searching for something else!" 
                : "Ready to cook? Search for recipes or try the random recipe button!"}
            </p>
          )
        )}
      </div>

      {/* Recipe Modal */}
      {showModal && selectedRecipe && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <button 
              className="modal-save" 
              onClick={() => toggleFavorite(selectedRecipe)}
            >
              {isFavorite(selectedRecipe.idMeal) ? "Remove Favorite" : "Save Recipe"}
            </button>
            <h2 className="modal-title">{selectedRecipe.strMeal}</h2>
            <img 
              className="modal-image"
              src={selectedRecipe.strMealThumb} 
              alt={selectedRecipe.strMeal} 
            />
            <h3>Ingredients:</h3>
            <ul className="ingredients-list">
              {getIngredients(selectedRecipe).map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
            <h3>Instructions:</h3>
            <p className="instructions">
              {selectedRecipe.strInstructions}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;