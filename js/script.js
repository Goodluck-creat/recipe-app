// Variables
const closePopupBtn = document.querySelector('#close-popup'),
    popupContainer = document.querySelector('#popup-container'),
    popUps = document.querySelectorAll('.popup'),
    searchForm = document.querySelector('#search-form'),
    randomSection = document.querySelector('#random-section'),
    randomRecipes = document.querySelector('#random-recipes'),
    favoriteFoodContainer = document.querySelector('.favorite-foods-container');
let searchedMeal = false;


// Functions
let getFavoriteMealsFromLocalStorage = () => {
    // get meal IDs from local storage
    // local storage items are stored as strings hence we convert to JSON
    let mealIds = JSON.parse(localStorage.getItem('mealIds'));


    if (mealIds == null) {
        // if there is no meal IDs in local storage then set one
        localStorage.setItem('mealIds', JSON.stringify([]));
    }

    // return meal IDs
    return mealIds;
}



let addFavoriteMealToLocalStorage = (mealId) => {
    // get meal IDs
    let mealIds = getFavoriteMealsFromLocalStorage();
    // add passed argument to meal IDs
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}



let removeFavoriteMealFromLocalStorage = (mealId) => {
    // get meal IDs
    let mealIds = getFavoriteMealsFromLocalStorage();
    // add passed argument from meal IDs
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(meal => meal !== mealId)));
}



let loadDOM = (mealData) => {
    let meal = document.createElement('div');
    meal.classList.add('random-recipe');
    meal.innerHTML = `
    <img class="random-meal-image popup" id="${mealData.idMeal}" src="${mealData.strMealThumb}" alt="">
    <p class="random-meal-category">${mealData.strCategory}</p>
    <p class="random-meal-detail"><span id="${mealData.idMeal}" class="random-meal-name">${mealData.strMeal}</span> <span><button class="fav-btn" id="${mealData.idMeal}"><i class="fa fa-heart"></i></button></span></p>
    `;
    randomRecipes.appendChild(meal);
}



let fetchRandomMeals = async ()  => {

    // we only want to fetch random meals if no meals was searched

    if (!searchedMeal) {
        // load our animation
        randomSection.querySelector('#random-header').innerText = `Fetching random meal...`;
        randomRecipes.innerHTML = '<img class="loading-image" src="images/loading.gif">';

        try {

            // fetch data from API
            let response = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
            let data = await response.json();
            let meals = data.meals;
        
            // reseting our random section to upload results
            randomSection.querySelector('#random-header').innerText = `Random Meal`;
            randomRecipes.innerHTML = '';
        
            for(let i = 0; i < meals.length; i++) {
                loadDOM(meals[i]);
            }
        
            // listening for favorite button clicks of generated items
            document.querySelectorAll('.fav-btn').forEach((btn)=>{
            
                btn.addEventListener('click', ()=>{
                    if (btn.classList.contains('active')) {
                        // remove meal ID from local storage
                        removeFavoriteMealFromLocalStorage(btn.id);
                        // remove active class from button
                        btn.classList.remove('active');
                    } else {
                        // add meal ID to local storage
                        addFavoriteMealToLocalStorage(btn.id);
                        // add active class to button
                        btn.classList.add('active');
                    }
        
                    // reloading our favorite meals container
                    fetchFavoriteMeals();
                });
        
            });
        
            // listening for popup clicks of generated items
            document.querySelectorAll('.popup').forEach((item)=>{
                item.addEventListener('click', ()=>{
                    showMealInfo(item.id);
                })
            });
        
        } catch {
            // if errors
            setTimeout(()=>{
                randomSection.querySelector('#random-header').innerText = `Couldn't fetch random meal`;
                randomRecipes.innerHTML = `<img class="sorry-animation" src="images/sorry.gif">`;
            }, 5000);
        }
    }

}



let  searchMeal = async () => {
    let search = document.querySelector('#search-input').value,
    url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`;

    // pausing our random meal fetch on intervals since a meal was searched
    searchedMeal = true;

    // loading animation
    randomSection.querySelector('#random-header').innerText = `Searching ${search} recipes...`;
    randomRecipes.innerHTML = `<img class="loading-image" src="images/loading.gif">`; 

    try {
        // fetching from API
        const ourRequest = await fetch(url);
        // converting our response from string to json format
        const data = await ourRequest.json();

        if (data.meals) {
            // if there was returned data

            // this lets our animation to load for a while
            // before updating our DOM
            setTimeout(()=>{
                const meals = data.meals;
    
                // reseting our random section to upload results
                randomSection.querySelector('#random-header').innerText = `Search results for ${search}`;
                randomRecipes.innerHTML = '';
        
                // looping through meals results
                for(let i = 0; i < meals.length; i++) {
                    loadDOM(meals[i]);
                }
        
                // listening for favorite button clicks of generated items
                document.querySelectorAll('.fav-btn').forEach((btn)=>{
                    
                    btn.addEventListener('click', ()=>{
                        if (btn.classList.contains('active')) {
                            removeFavoriteMealFromLocalStorage(btn.id);
                            btn.classList.remove('active');
                        } else {
                            addFavoriteMealToLocalStorage(btn.id);
                            btn.classList.add('active');
                        }
        
                        // reloading our favorite meals container
                        fetchFavoriteMeals();
                    });
    
                });
    
                // listening for popup clicks of generated items
                document.querySelectorAll('.popup').forEach((item)=>{
                    item.addEventListener('click', ()=>{
                        showMealInfo(item.id);
                    });
                });
            }, 3000)

        } else {
            // if no returned data or null
            randomSection.querySelector('#random-header').innerText = `No results for ${search}`;
            randomRecipes.innerHTML = `<img class="sorry-animation" src="images/sorry.gif">`;
        }

    } catch {
        // if errors
        setTimeout(()=>{
        randomSection.querySelector('#random-header').innerText = `Sorry there was an error while fetching results`;
        randomRecipes.innerHTML = '<img class="sorry-animation" src="images/sorry.gif">';
        }, 3000);
    }

    // wait 2 min to unset fetch random meal pause
    setTimeout(()=>{ searchedMeal = false; }, 120000);
}



let fetchFavoriteMeals = async () => {
    favoriteFoodContainer.innerHTML = `<img style="width:3rem; margin-bottom:1rem;" src="images/loading2.gif">`;

    let favoriteMeals = getFavoriteMealsFromLocalStorage()

    try {
        if (favoriteMeals.length <= 0 || favoriteMeals == null || !favoriteMeals.length) {
            favoriteFoodContainer.innerHTML = `<h4 class="no-favorite">You have no favorite meals yet</h4>`;
        } else {
            // clearing animation
            favoriteFoodContainer.innerHTML = ``;

            for(let i=0; i<favoriteMeals.length; i++) {
                // fetch data for each meal ID
                const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${parseInt(favoriteMeals[i])}`);
                const data = await response.json();
                const meal = data.meals
    
                // generate DOM
                let favoriteFoodItem = document.createElement('div');
                favoriteFoodItem.classList.add('favorite-food-item');
        
                favoriteFoodItem.innerHTML = `
                <button class="remove-favorite-button" id="${meal[0].idMeal}"><i class="fa fa-times"></i></button>
                <img class="popup" id="${meal[0].idMeal}" src="${meal[0].strMealThumb}" alt="meal image">
                <p class="popup" id="${meal[0].idMeal}" title="${meal[0].strMeal}">${meal[0].strMeal}</p>
                `
        
                favoriteFoodContainer.appendChild(favoriteFoodItem);
            }
        
            // animation to display or hide remove button
            document.querySelectorAll('.favorite-food-item').forEach((item)=> {
                item.addEventListener('mouseover', ()=>{
                    let removeButton = item.querySelector('.remove-favorite-button');
                    removeButton.style.opacity = 0.8;
                })
                item.addEventListener('mouseout', ()=>{
                    let removeButton = item.querySelector('.remove-favorite-button');
                    removeButton.style.opacity = 0;
                })
            })
    
            // listening for remove favorite button clicks
            document.querySelectorAll('.remove-favorite-button').forEach((button)=>{
                button.addEventListener('click', ()=>{
                    removeFavoriteMealFromLocalStorage(button.id);
                    fetchFavoriteMeals();
                })
            })
    
            // listening for popup clicks of generated items
            document.querySelectorAll('.popup').forEach((item)=>{
                item.addEventListener('click', ()=>{
                    showMealInfo(item.id);
                })
            });
        }
    } catch {
        // if errors
        setTimeout(()=>{
            favoriteFoodContainer.innerHTML = `<h4 class="no-favorite">Sorry.. there was an error while fetching favorite meals. Try refreshing your browser!</h4>`;
        }, 3000);
    }
}



let showMealInfo = async (meal)=>{
    let mealInfoContainer = document.querySelector('.meal-info');

    // display popup
    popupContainer.classList.remove('hidden');

    // loading animation
    mealInfoContainer.innerHTML = `<img style="width:3rem" src="images/loading.gif">`;
    mealInfoContainer.classList.add('loading-meal-animation');

    try {
        // fetch data
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${parseInt(meal)}`);
        const data = await response.json();
        const mealData = data.meals;

        // generate DOM
        mealInfoContainer.innerHTML = `
            <h2>${mealData[0].strMeal}</h2>
            <img src="${mealData[0].strMealThumb}" alt="">
            <p>${mealData[0].strInstructions}</p>
            <ul id="ingredients">
            <li class="ingredient-header">Ingredients & measurements</li>
            </ul>
            <p id="meal-video"><a href="${mealData[0].strYoutube}" target="_blank">Watch video</a></p>
        `

        // removing loading animation style
        mealInfoContainer.classList.remove('loading-meal-animation');

        // looping through 1 to 20 to get all ingredients from API data then update DOM
        for(let i=1;i <= 20;i++) {
            if(mealData[0]["strIngredient"+i]){
                let li = document.createElement('li');
                li.innerHTML = `<li class="ingredient">${mealData[0]["strIngredient"+i]} - ${mealData[0]["strMeasure"+i]}</li>`;
                mealInfoContainer.querySelector('#ingredients').appendChild(li);
            } else {
                break;
            }
        }

    } catch {
        // if errors
        setTimeout(()=>{
            mealInfoContainer.innerHTML = `
            <h4 class="meal-info-error">Sorry there was an error while fetching meal data</h4>
            <img style="width: 15rem" src="images/sorry.gif">
            `;
            mealInfoContainer.classList.add('loading-meal-animation');
        }, 3000);
    }

}


// Event Listeners
closePopupBtn.addEventListener('click', ()=>{
    popupContainer.classList.add('hidden');
})

searchForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    searchMeal();
})


// Code blocks
fetchFavoriteMeals();
fetchRandomMeals();
// fetch random meal every 30 seconds
setInterval(()=>{fetchRandomMeals()}, 30000);