import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://pokeapi.co/api/v2/";
const DEX_LIMIT = 1017;

// Define variables for resusability
var includeAbility = true;
var includeMoves = true;
var includeItem = true;
var pokeName;
var pokeSprite;
var pokeAbility;
var pokeMoves;
var pokeItem;
var pokeItemSprite;

// Getting random pokemon, item, ability, moveset
// Turning the public folder static
app.use(express.static("public"));
// Using the body parser as a middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", { content: "Waiting for data..." });
});

//getting a random entry
// item will have attribute of "holdable" if able to be held
app.post("/get-random", async (req, res) => {
  var dexNumber = Math.floor(Math.random() * DEX_LIMIT) + 1;
  try {
    var pokemon = await axios.get(API_URL + "/pokemon/" + dexNumber);
    pokeName = [pokemon.data.name];
    // get the pokemon sprite image
    pokeSprite = [pokemon.data.sprites.front_default];
    // get random ability
    var abilityNumber = Math.floor(
      Math.random() * pokemon.data.abilities.length
    );

    // Checks if "No Ability is selected"
    pokeAbility = [pokemon.data.abilities[abilityNumber].ability.name];
    // get moves
    pokeMoves = [];
    if (pokemon.data.moves.length < 4) {
      for (var i = 0; i < pokemon.data.moves.length; i++) {
        pokeMoves.push(pokemon.data.moves[i].move.name);
      }
    } else {
      for (var i = 0; i < 4; i++) {
        var moveNumber = Math.floor(Math.random() * pokemon.data.moves.length);
        var move = pokemon.data.moves[moveNumber].move.name;
        while (pokeMoves.includes(move)) {
          move =
            pokemon.data.moves[
              Math.floor(Math.random() * pokemon.data.moves.length)
            ].move.name;
        }
        pokeMoves.push(move);
      }
    }
    pokeMoves = [pokeMoves];

    // getting all holdable items
    var holdableItems = await axios.get(API_URL + "/item-attribute/holdable");
    var holdableItemNumber = Math.floor(
      Math.random() * holdableItems.data.items.length
    );
    var item = await axios.get(
      holdableItems.data.items[holdableItemNumber].url
    );
    pokeItem = [item.data.name];
    pokeItemSprite = [item.data.sprites.default];
    // Checks if any of the attributes should be excluded
    if (req.body["ability"] === "no") {
      pokeAbility = "N/A";
      includeAbility = false;
    }
    if (req.body["moves"] === "no") {
      pokeMoves = "N/A";
      includeMoves = false;
    }
    if (req.body["item"] === "no") {
      pokeItem = "N/A";
      includeItem = false;
    }
    res.render("index.ejs", {
      pokemonName: convertReadable(pokeName),
      // if you want to use an image then you do not stringify the URL
      pokemonImage: pokeSprite,
      pokemonAbility: convertReadable(pokeAbility),
      pokemonMoves: convertReadableList(pokeMoves),
      pokemonItem: convertReadable(pokeItem),
      itemImage: pokeItemSprite,
    });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.data) });
  }
});

// Getting a random team so 6 pokemon
app.post("/get-random-team", async (req, res) => {
  try {
    pokeName = [];
    pokeSprite = [];
    pokeAbility = [];
    pokeMoves = [];
    pokeItem = [];
    pokeItemSprite = [];
    for (var x = 0; x < 6; x++) {
      var dexNumber = Math.floor(Math.random() * DEX_LIMIT) + 1;
      var pokemon = await axios.get(API_URL + "/pokemon/" + dexNumber);
      pokeName.push(pokemon.data.name);
      // get the pokemon sprite image
      pokeSprite.push(pokemon.data.sprites.front_default);
      // get random ability
      var abilityNumber = Math.floor(
        Math.random() * pokemon.data.abilities.length
      );

      // Checks if "No Ability is selected"
      pokeAbility.push(pokemon.data.abilities[abilityNumber].ability.name);
      // get moves
      var pokeMovesEach = [];
      if (pokemon.data.moves.length < 4) {
        for (var i = 0; i < pokemon.data.moves.length; i++) {
          pokeMovesEach.push(pokemon.data.moves[i].move.name);
        }
      } else {
        for (var i = 0; i < 4; i++) {
          var moveNumber = Math.floor(
            Math.random() * pokemon.data.moves.length
          );
          var move = pokemon.data.moves[moveNumber].move.name;
          while (pokeMovesEach.includes(move)) {
            move =
              pokemon.data.moves[
                Math.floor(Math.random() * pokemon.data.moves.length)
              ].move.name;
          }
          pokeMovesEach.push(move);
        }
      }
      pokeMoves.push(pokeMovesEach);

      // getting all holdable items
      var holdableItems = await axios.get(API_URL + "/item-attribute/holdable");
      var holdableItemNumber = Math.floor(
        Math.random() * holdableItems.data.items.length
      );
      var item = await axios.get(
        holdableItems.data.items[holdableItemNumber].url
      );
      pokeItem.push(item.data.name);
      pokeItemSprite.push(item.data.sprites.default);
    }
    // Checks if any of the attributes should be excluded
    if (req.body["ability"] === "no") {
      pokeAbility = "N/A";
      includeAbility = false;
    }
    if (req.body["moves"] === "no") {
      pokeMoves = "N/A";
      includeMoves = false;
    }
    if (req.body["item"] === "no") {
      pokeItem = "N/A";
      includeItem = false;
    }
    res.render("index.ejs", {
      pokemonName: convertReadable(pokeName),
      // if you want to use an image then you do not stringify the URL
      pokemonImage: pokeSprite,
      pokemonAbility: convertReadable(pokeAbility),
      pokemonMoves: convertReadableList(pokeMoves),
      pokemonItem: convertReadable(pokeItem),
      itemImage: pokeItemSprite,
    });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.data) });
  }
});

app.post("/reroll", async (req, res) => {
  try {
    for (var y = 0; y < pokeName.length; y++) {
      if (req.body["rerollAll" + y] === "yes") {
        var dexNumber = Math.floor(Math.random() * DEX_LIMIT) + 1;
        var pokemon = await axios.get(API_URL + "/pokemon/" + dexNumber);
        pokeName[y] = pokemon.data.name;
        // get the pokemon sprite image
        pokeSprite[y] = pokemon.data.sprites.front_default;
        // get random ability
        var abilityNumber = Math.floor(
          Math.random() * pokemon.data.abilities.length
        );

        if (includeAbility) {
          pokeAbility[y] = pokemon.data.abilities[abilityNumber].ability.name;
        }

        if (includeMoves) {
          // get moves
          pokeMoves[y] = [];
          if (pokemon.data.moves.length < 4) {
            for (var i = 0; i < pokemon.data.moves.length; i++) {
              pokeMoves[y].push(pokemon.data.moves[i].move.name);
            }
          } else {
            for (var i = 0; i < 4; i++) {
              var moveNumber = Math.floor(
                Math.random() * pokemon.data.moves.length
              );
              var move = pokemon.data.moves[moveNumber].move.name;
              while (pokeMoves[y].includes(move)) {
                move =
                  pokemon.data.moves[
                    Math.floor(Math.random() * pokemon.data.moves.length)
                  ].move.name;
              }
              pokeMoves[y].push(move);
            }
          }
        }

        if (includeItem) {
          // getting all holdable items
          var holdableItems = await axios.get(
            API_URL + "/item-attribute/holdable"
          );
          var holdableItemNumber = Math.floor(
            Math.random() * holdableItems.data.items.length
          );
          var item = await axios.get(
            holdableItems.data.items[holdableItemNumber].url
          );
          pokeItem[y] = item.data.name;
          pokeItemSprite[y] = item.data.sprites.default;
        }
      }

      // Rerolling just ability
      if (
        req.body["rerollAll" + y] !== "yes" &&
        req.body["rerollAbility" + y] === "yes"
      ) {
        var pokemon = await axios.get(API_URL + "/pokemon/" + pokeName[y]);
        var abilityNumber = Math.floor(
          Math.random() * pokemon.data.abilities.length
        );
        pokeAbility[y] = pokemon.data.abilities[abilityNumber].ability.name;
      }

      // Rerolling just moves
      if (
        req.body["rerollAll" + y] !== "yes" &&
        req.body["rerollMoves" + y] === "yes"
      ) {
        var pokemon = await axios.get(API_URL + "/pokemon/" + pokeName[y]);
        pokeMoves[y] = [];
        if (pokemon.data.moves.length < 4) {
          for (var i = 0; i < pokemon.data.moves.length; i++) {
            pokeMoves[y].push(pokemon.data.moves[i].move.name);
          }
        } else {
          for (var i = 0; i < 4; i++) {
            var moveNumber = Math.floor(
              Math.random() * pokemon.data.moves.length
            );
            var move = pokemon.data.moves[moveNumber].move.name;
            while (pokeMoves[y].includes(move)) {
              move =
                pokemon.data.moves[
                  Math.floor(Math.random() * pokemon.data.moves.length)
                ].move.name;
            }
            pokeMoves[y].push(move);
          }
        }
      }

      // Rerolling just item
      if (
        req.body["rerollAll" + y] !== "yes" &&
        req.body["rerollItem" + y] === "yes"
      ) {
        var holdableItems = await axios.get(
          API_URL + "/item-attribute/holdable"
        );
        var holdableItemNumber = Math.floor(
          Math.random() * holdableItems.data.items.length
        );
        var item = await axios.get(
          holdableItems.data.items[holdableItemNumber].url
        );
        pokeItem[y] = item.data.name;
        pokeItemSprite[y] = item.data.sprites.default;
      }
    }

    res.render("index.ejs", {
      pokemonName: convertReadable(pokeName),
      // if you want to use an image then you do not stringify the URL
      pokemonImage: pokeSprite,
      pokemonAbility: convertReadable(pokeAbility),
      pokemonMoves: convertReadableList(pokeMoves),
      pokemonItem: convertReadable(pokeItem),
      itemImage: pokeItemSprite,
    });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

// Listening on port 3000.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Creating functino to capitalize first letter and switch hyphen to space
function convertReadable(wordList) {
  if (wordList === "N/A") {
    return wordList;
  }
  var newWordList = [];
  for (var x = 0; x < wordList.length; x++) {
    var newWord = wordList[x][0].toUpperCase() + wordList[x].slice(1);
    var toUpper = false;
    for (var i = 0; i < newWord.length; i++) {
      if (toUpper) {
        newWord =
          newWord.substring(0, i) +
          newWord[i].toUpperCase() +
          newWord.substring(i + 1);
        toUpper = false;
      }
      if (newWord[i] === "-") {
        newWord = newWord.substring(0, i) + " " + newWord.substring(i + 1);
        toUpper = true;
      }
    }
    newWordList.push(newWord);
  }
  return newWordList;
}

function convertReadableList(wordList) {
  if (wordList === "N/A") {
    return wordList;
  }
  var newWordList = [];
  for (var x = 0; x < wordList.length; x++) {
    newWordList.push(convertReadable(wordList[x]));
  }
  return newWordList;
}
