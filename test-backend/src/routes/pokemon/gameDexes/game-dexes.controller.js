const asyncHandler = require("express-async-handler");
const National = require("../../../models/pokemon/nationalModel");
const { connect, disconnect } = require("../connection");

const listDex = asyncHandler(async (request, response) => {
  const { game } = request.params;
  const { typeOne, typeTwo, asc, desc } = request.query;

  let gameDex = [];
  const gameSelect = `pokedexNumber name.english type abilities baseStats`;

  let typeStatement = null;
  if (typeOne && typeTwo) {
    typeStatement = [
      { "type.one": typeOne, "type.two": typeTwo },
      { "type.one": typeTwo, "type.two": typeOne },
    ];
  } else if (!typeOne && typeTwo) {
    typeStatement = [{ "type.one": typeTwo }, { "type.two": typeTwo }];
  } else if (!typeTwo && typeOne) {
    typeStatement = [{ "type.one": typeOne }, { "type.two": typeOne }];
  }

  const sort = asc ? { [asc]: 1 } : desc ? { [desc]: -1 } : { [`pokedexNumber.${game}`]: 1 };

  if (typeStatement) {
    gameDex = await National.find()
      .where(`pokedexNumber.${game}`)
      .exists(true)
      .or(typeStatement)
      .select(gameSelect)
      .sort(sort);
  } else {
    gameDex = await National.find()
      .where(`pokedexNumber.${game}`)
      .exists(true)
      .select(gameSelect)
      .sort(sort);
  }

  disconnect();
  response.status(200).json(gameDex);
});

module.exports = {
  list: [connect, listDex],
};
