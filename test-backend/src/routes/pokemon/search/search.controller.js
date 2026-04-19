const asyncHandler = require("express-async-handler");
const National = require("../../../models/pokemon/nationalModel");
const { connect, disconnect } = require("../connection");

const pokemonKnowsMove = (moveLists, moveName) => {
  for (const [, moveList] of Object.entries(moveLists)) {
    if (moveList.some((move) => move.name === moveName)) {
      return true;
    }
  }
  return false;
};

const searchPokemon = asyncHandler(async (request, response) => {
  const { moveOne, moveTwo, moveThree, moveFour, game } = request.query;
  const requestedMoves = [moveOne, moveTwo, moveThree, moveFour].filter(Boolean);

  if (requestedMoves.length === 0) {
    disconnect();
    response.status(200).json([]);
    return;
  }

  const gameList = await National.find()
    .where(`moves.${game}`)
    .exists(true)
    .select(`name.english pokedexNumber type abilities baseStats moves.${game}`)
    .sort({ _id: 1 });

  const results = gameList.filter((pokemon) => {
    const moveLists = pokemon.moves[game];
    return requestedMoves.every((moveName) => pokemonKnowsMove(moveLists, moveName));
  }).map((pokemon) => ({
    _id: pokemon._doc._id,
    name: pokemon._doc.name,
    pokedexNumber: pokemon._doc.pokedexNumber,
    type: pokemon._doc.type,
    abilities: pokemon._doc.abilities,
    baseStats: pokemon._doc.baseStats,
  }));

  disconnect();
  response.status(200).json(results);
});

module.exports = {
  read: [connect, searchPokemon],
};
