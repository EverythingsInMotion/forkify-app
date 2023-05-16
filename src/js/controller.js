import { async } from 'regenerator-runtime';
import * as model from './model.js';

import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { MODAL_CLOSE_SEC } from './config.js';

const recipeContainer = document.querySelector('.recipe');

// if (module.hot) {
//   module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////



const controlRecipes = async function () {

  try {
    // Get #id url
    const id = window.location.hash.slice(1)

    if (!id) return;

    // Loading spinner
    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // Update bookmarks view
    bookmarksView.update(model.state.bookmarks)

    // Load recipe
    await model.loadRecipe(id)

    // Rendering the recipe
    recipeView.render(model.state.recipe)

  } catch (err) {
    recipeView.renderError()
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // Load search
    await model.loadSearchResults(query);

    // Render Results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage())

    // Render initial pagination
    paginationView.render(model.state.search)

  } catch (err) {
    console.log(err);
  }
}

const controlPagination = function (goToPage) {
  // Render New Results
  // resultsView.render(model.state.search.results);
  resultsView.render(model.getSearchResultsPage(goToPage))

  // Render new pagination
  paginationView.render(model.state.search)
}

const controlServings = function (newServings) {
  // Update recipe servings (state)
  model.updateServings(newServings);

  // Update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function () {
  // Add/Remove bookmarks
  if (!model.state.recipe.bookmarked)
    model.addBookmark(model.state.recipe)
  else
    model.deleteBookmark(model.state.recipe.id)

  // Update recipeview
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe) {
  try {

    // Show loading spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success Message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks)

    // Change ID in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 2000)
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message)
  }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();