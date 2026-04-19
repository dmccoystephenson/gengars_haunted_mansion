const asyncHandler = require("express-async-handler");
const Moves = require("../../../models/pokemon/movesModel");
const National = require("../../../models/pokemon/nationalModel");
const { connect, disconnect } = require("../connection");
const gameDropDown = require("../variables/gameDropDown");

/* ---------- Middleware ---------- */

const moveExists = asyncHandler(async (request, response, next) => {
  const { id } = request.params;
  let move = null;

  isNaN(id)
    ? (move = await Moves.findOne({ key: id }).lean())
    : (move = await Moves.findById(Number(id)).lean());

  if (!move) {
    response.status(400);
    throw new Error("Move not found.");
  } else {
    response.locals.move = move;
    next();
  }
});

/* ------- Helper Functions ------- */

const addToCategory = (collection, category, pokemon) => {
  if (!collection[category]) {
    collection[category] = [];
  }
  collection[category].push(pokemon);
};

const findMoveInList = (moveList, moveName, isObjectList) =>
  isObjectList
    ? moveList.find((listMove) => listMove.name === moveName)
    : moveList.find((listMove) => listMove === moveName);

const getPokemonThatKnowMoveByGame = async (moveName, game) => {
  const pokemonThatLearnMove = {};
  const gameDex = await National.find()
    .select(`pokedexNumber name type moves.${game}`)
    .sort({ _id: 1 });

  gameDex.forEach((pokemon) => {
    if (!pokemon.moves[game]) return;

    const basePokemon = {
      id: pokemon._id,
      name: pokemon.name.english,
      type: pokemon.type,
    };

    for (const [category, moveList] of Object.entries(pokemon.moves[game])) {
      const isObjectList = category === "level-up" || category === "technical-machine";
      const foundMove = findMoveInList(moveList, moveName, isObjectList);

      if (foundMove) {
        const pokemonEntry = category === "level-up"
          ? { ...basePokemon, level: foundMove.lvl }
          : category === "egg"
          ? { ...basePokemon, eggGroup: pokemon.eggGroup }
          : basePokemon;

        addToCategory(pokemonThatLearnMove, category, pokemonEntry);
      }
    }
  });
  return pokemonThatLearnMove;
};

const getMoveGameDropDown = (generation) => {
  switch (Number(generation)) {
    case 9:
      return gameDropDown.slice(0, -17);
    case 8:
      return gameDropDown.slice(0, -14);
    case 7:
      return gameDropDown.slice(0, -12);
    case 6:
      return gameDropDown.slice(0, -10);
    case 5:
      return gameDropDown.slice(0, -8);
    case 4:
      return gameDropDown.slice(0, -6);
    case 3:
      return gameDropDown.slice(0, -4);
    case 2:
      return gameDropDown.slice(0, -2);
    case 1:
      return gameDropDown;
    default:
      return gameDropDown;
  }
};

/* ----------- CRUDL Ops ---------- */

const readMove = asyncHandler(async (request, response) => {
  const { move } = response.locals;
  const { game } = request.params;
  const moveGameDropDown = getMoveGameDropDown(move.generation);
  let returnMoveObj = {
    ...move,
    gameDropDown: moveGameDropDown,
  };
  let pokemonThatLearnMove = {};
  if (game) {
    pokemonThatLearnMove = await getPokemonThatKnowMoveByGame(
      move.name.english,
      game
    );
  } else {
    pokemonThatLearnMove = await getPokemonThatKnowMoveByGame(
      move.name.english,
      moveGameDropDown[0].key
    );
  }
  returnMoveObj = {
    ...returnMoveObj,
    pokemonThatLearnMove,
  }

  disconnect();
  response.status(200).json(returnMoveObj);
});

const listMoves = asyncHandler(async (request, response) => {
  const moves = await Moves.find()
    .select("name.english type category pp power accuracy")
    .sort({ _id: 1 });

  disconnect();
  response.status(200).json(moves);
});

const listMoveNames = asyncHandler(async (request, response) => {
  const movesNames = await Moves.find()
    .select("name.english")
    .sort({ 'name.english': 1 });

  disconnect();
  response.status(200).json(movesNames);
}); 

module.exports = {
  read: [connect, moveExists, readMove],
  list: [connect, listMoves],
  listNames: [connect, listMoveNames]
};
