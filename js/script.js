// Variables
const closePopupBtn = document.querySelector('#close-popup'),
    popupContainer = document.querySelector('#popup-container'),
    popUps = document.querySelectorAll('.popup'),
    searchForm = document.querySelector('#search-form'),
    randomSection = document.querySelector('#random-section'),
    randomRecipes = document.querySelector('#random-recipes'),
    favouriteFoodContainer = document.querySelector('.favorite-foods-container');


// Functions
let loadDOM = (mealData) => {
    let meal = document.createElement('div');
    meal.classList.add('random-recipe');
    meal.innerHTML = `
    <img class="random-meal-image popup" id="${mealData.idMeal}" src="${mealData.strMealThumb}" alt="">
    <p class="random-meal-category">${mealData.strCategory}</p>
    <p class="random-meal-detail"><span id="${mealData.idMeal}" class="random-meal-name">${mealData.strMeal}</span> <span><button class="fav-btn" id="${mealData.idMeal}"><i class="fa fa-heart"></i></button></span></p>
    `;
    randomRecipes.appendChild(meal);
    console.log('Dom mounted');
}

let fetchRandomMeals = async ()  => {
    let response = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
    let data = await response.json();
    let meals = data.meals;

    // reseting our random section to upload results
    randomSection.querySelector('#random-header').innerText = `Random Meal(s)`;
    randomRecipes.innerHTML = '';

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
            fetchFavouriteMeals();
        });

    });

    // listening for popup clicks of generated items
    document.querySelectorAll('.popup').forEach((item)=>{
        item.addEventListener('click', ()=>{
            showMealInfo(item.id);
        })
    });
}

let  searchMeal = async () => {
    let search = document.querySelector('#search-input').value,
    url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`;

    try {
        // fetching from API
        const ourRequest = await fetch(url);
        // converting our response from string to json format
        const data = await ourRequest.json();

        if (data.meals) {
            const meals = data.meals;
    
            // reseting our random section to upload results
            randomSection.querySelector('#random-header').innerText = `Search results for ${search}`;
            randomRecipes.innerHTML = '';
    
            // looping through meals results
            for(let i = 0; i < meals.length; i++) {
                console.log('loop '+ i)
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
                    fetchFavouriteMeals();
                });

            });

            // listening for popup clicks of generated items
            document.querySelectorAll('.popup').forEach((item)=>{
                item.addEventListener('click', ()=>{
                    showMealInfo(item.id);
                });
            });

        } else {
            randomSection.querySelector('#random-header').innerText = `No results for ${search}`;
            randomRecipes.innerHTML = '';
        }

    } catch {
        setTimeout(10000, ()=>{
            // reseting our random section to upload results
            randomSection.querySelector('#random-header').innerText = `Sorry there was an error while fetching results`;
            randomRecipes.innerHTML = '';
        })
    }
}

let getFavoriteMealsFromLocalStorage = () => {
    let mealIds = JSON.parse(localStorage.getItem('mealIds'));

    if (mealIds == null) {
        localStorage.setItem('mealIds', JSON.stringify([]));
    }

    return mealIds;
}

let addFavoriteMealToLocalStorage = (mealId) => {
    let mealIds = getFavoriteMealsFromLocalStorage();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

let removeFavoriteMealFromLocalStorage = (mealId) => {
    let mealIds = getFavoriteMealsFromLocalStorage();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(meal => meal !== mealId)));
}

let fetchFavouriteMeals = async () => {
    favouriteFoodContainer.innerHTML = ``;

    let favoriteMeals = getFavoriteMealsFromLocalStorage()

    if (favoriteMeals.length < 1 || favoriteMeals == null) {
        favouriteFoodContainer.innerHTML = `<h5 class="no-favorite">You have no favorite meals yet</h5>`;
    } else {
        for(let i=0; i<favoriteMeals.length; i++) {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${parseInt(favoriteMeals[i])}`);
            const data = await response.json();
            const meal = data.meals

            let favoriteFoodItem = document.createElement('div');
            favoriteFoodItem.classList.add('favorite-food-item');
    
            favoriteFoodItem.innerHTML = `
            <button class="remove-favorite-button" id="${meal[0].idMeal}"><i class="fa fa-times"></i></button>
            <img class="popup" id="${meal[0].idMeal}" src="${meal[0].strMealThumb}" alt="meal image">
            <p class="popup" id="${meal[0].idMeal}" title="${meal[0].strMeal}">${meal[0].strMeal}</p>
            `
    
            favouriteFoodContainer.appendChild(favoriteFoodItem);
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
                fetchFavouriteMeals();
            })
        })

        // listening for popup clicks of generated items
        document.querySelectorAll('.popup').forEach((item)=>{
            item.addEventListener('click', ()=>{
                showMealInfo(item.id);
            })
        });
    }

}

let showMealInfo = async (meal)=>{
    let mealInfoContainer = document.querySelector('.meal-info');

    // display popup
    popupContainer.classList.remove('hidden');

    // loading animation
    mealInfoContainer.innerHTML = `<img src="images/loading.gif">`;
    mealInfoContainer.classList.add('loading');

    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${parseInt(meal)}`);
        const data = await response.json();
        const mealData = data.meals;

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
        mealInfoContainer.classList.remove('loading');

        for(let i=1;i <= 20;i++) {
            console.log('entered loop')
            if(mealData[0]["strIngredient"+i]){
                console.log(`condition ${i} met`);
                let li = document.createElement('li');
                li.innerHTML = `<li class="ingredient">${mealData[0]["strIngredient"+i]} - ${mealData[0]["strMeasure"+i]}</li>`;
                mealInfoContainer.querySelector('#ingredients').appendChild(li);
            } else {
                break;
            }
        }


    } catch {
        setTimeout(10000, ()=>{
            mealInfoContainer.innerHTML = `<h5 class="meal-info-error">Sorry there was an error while fetching meal data</h5>`;
            mealInfoContainer.classList.add('loading');
        });
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
fetchFavouriteMeals();
fetchRandomMeals();