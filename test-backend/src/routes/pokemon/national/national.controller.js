const asyncHandler = require("express-async-handler");
const National = require("../../../models/pokemon/nationalModel");
const Moves = require("../../../models/pokemon/movesModel");
const FormTabs = require('../../../models/pokemon/formTabsModel');
const Evolutions = require('../../../models/pokemon/evolutionModel');
const { connect, disconnect } = require("../connection");

/* ---------- Helpers ---------- */

const formatMoveData = (move, dbMove) => ({
  ...move,
  id: dbMove._id,
  name: dbMove.name.english,
  type: dbMove.type,
  category: dbMove.category,
  pp: dbMove.pp,
  power: dbMove.pp,
  accuracy: dbMove.accuracy,
  contact: dbMove.contact,
  shortEffect: dbMove.effect?.shortEffect,
  target: dbMove.target,
  contest: dbMove.contest,
  priority: dbMove.priority,
});

const getPokemonMoves = (pokemonMoves, dbMoves) => {
  const returnMoves = {};
  for (const [game, methodList] of Object.entries(pokemonMoves)) {
    returnMoves[game] = {};
    for (const [method, list] of Object.entries(pokemonMoves[game])) {
      const isObjectList = typeof list[0] === typeof {};
      const returnList = list.map((move) => {
        const moveName = isObjectList ? move.name : move;
        const foundMove = dbMoves.find(
          (dbMove) => dbMove.name.english === moveName
        );
        if (foundMove) {
          return isObjectList
            ? formatMoveData(move, foundMove)
            : formatMoveData({}, foundMove);
        }
      });
      returnMoves[game][method] = returnList;
    }
  }
  return returnMoves;
};

const getPokemonForms = async (pokemonId, formsTab, dbMoves) => {
  const returnForms = {
    startingIndex: 0,
    formsTab: []
  }

  for (let i = 0; i < formsTab.length - 1; i++) {
    console.log(i);
    const form = formsTab[i];
    if (form.id === pokemonId) {
      returnForms.startingIndex = i;
    }
    const pokemon = await National.findById(Number(form.id)).lean();
    pokemon.moves = getPokemonMoves(pokemon.moves, dbMoves);
    pokemon.baseStats = getPokemonBaseStats(pokemon.baseStats);
    pokemon.index = i;
    pokemon.formsTab = formsTab;
    returnForms.formsTab.push(pokemon);
  }

  return returnForms;
}

const calculateStatWidth = (baseStat, maxStat) =>
  Math.round((baseStat * 100) / maxStat);

const buildStatObject = (statName, baseStat, maxStat) => {
  const width = calculateStatWidth(baseStat, maxStat);
  return {
    base: baseStat,
    min: minStatFormula(statName, baseStat),
    max: maxStatFormula(statName, baseStat),
    tier: getTierColor(width),
    width,
  };
};

const STAT_MAX_VALUES = {
  hp: 255,
  atk: 180,
  def: 180,
  spatk: 230,
  spdef: 230,
  spd: 200,
};

const getPokemonBaseStats = (baseStats) => {
  return {
    hp: buildStatObject('hp', baseStats.hp, STAT_MAX_VALUES.hp),
    atk: buildStatObject('atk', baseStats.atk, STAT_MAX_VALUES.atk),
    def: buildStatObject('def', baseStats.def, STAT_MAX_VALUES.def),
    spatk: buildStatObject('spatk', baseStats.spatk, STAT_MAX_VALUES.spatk),
    spdef: buildStatObject('spdef', baseStats.spdef, STAT_MAX_VALUES.spdef),
    spd: buildStatObject('spd', baseStats.spd, STAT_MAX_VALUES.spd),
    total: baseStats.total,
  };
};

const hpFormula = (baseStat, IV, EV, level) => {
  return Math.floor(
    ((2 * baseStat + IV + EV / 4) * level) / 100 + level + 10
  );
};

const otherStat = (baseStat, IV, EV, level, nature) => {
  return Math.floor(
    (((2 * baseStat + IV + EV / 4) * level) / 100 + 5) * nature
  );
};

const minStatFormula = (title, stat) => {
  if (title === "hp") {
    return hpFormula(stat, 0, 0, 100);
  } else {
    return otherStat(stat, 0, 0, 100, 0.9);
  }
};

const maxStatFormula = (title, stat) => {
  if (title === "hp") {
    return hpFormula(stat, 31, 252, 100);
  } else {
    return otherStat(stat, 31, 252, 100, 1.1);
  }
};

const getTierColor = (stat) => {
  let tierColor = '';
  const tier = {
    one: "bg-green-600",
    two: "bg-green-400",
    three: "bg-green-300",
    four: "bg-sky-500",
    five: "bg-sky-300",
    six: "bg-purple-200",
  };

  if (stat <= 16.6) {
    tierColor = tier.one;
  } else if (16.6 < stat && stat < 33.2) {
    tierColor = tier.two;
  } else if (33.2 < stat && stat < 49.8) {
    tierColor = tier.three;
  } else if (49.8 < stat && stat < 66.4) {
    tierColor = tier.four;
  } else if (66.4 < stat && stat < 83) {
    tierColor = tier.five;
  } else if (83 <= stat && stat < 100) {
    tierColor = tier.six;
  }
  return tierColor;
}

/* ---------- Middleware ---------- */

const pokemonExists = asyncHandler(async (request, response, next) => {
  const { id } = request.params;
  let pokemon = null;

  isNaN(id)
    ? (pokemon = await National.findOne({ key: id }).lean())
    : (pokemon = await National.findById(Number(id)).lean());

  if (!pokemon) {
    response.status(400);
    throw new Error("Pokemon not found.");
  } else {
    response.locals.pokemon = pokemon;
    next();
  }
});

const getMoves = asyncHandler(async (request, response, next) => {
  const moves = await Moves.find().lean();
  if (!moves) {
    response.status(400);
    throw new Error("Moves data not found, error on Server/Database side.");
  } else {
    response.locals.moves = moves;
    next();
  }
});

const reformatPokemonBaseStats = asyncHandler(async (request, response, next) => {
  const { pokemon } = response.locals;
  pokemon.baseStats = getPokemonBaseStats(pokemon.baseStats);
  response.locals.pokemon = pokemon;
  next();
});

const reformatPokemonEvolution = asyncHandler(async (request, response, next) => {
  const { pokemon } = response.locals;
  if (pokemon.evolution) {
    const evolutionTree = await Evolutions.findById(pokemon.evolution);
    if (evolutionTree) {
      pokemon.evolution = evolutionTree;
    }
    response.locals.pokemon = pokemon;
  }
  next();
});

const readPokemonByGame = asyncHandler(async (request, response, next) => {
  const { pokemon, moves } = response.locals;
  const { game } = request.params;
  pokemon.moves = getPokemonMoves(pokemon.moves, moves);
  disconnect();
  response.status(200).json(pokemon);
});

/* ----------- CRUD Ops ----------- */

const readPokemon = asyncHandler(async (request, response, next) => {
  const { pokemon, moves } = response.locals;
  const pokemonForms = await FormTabs.findById(Math.floor(pokemon._id)).lean();
  if (pokemon.formsTab) {
    const forms = await getPokemonForms(pokemon._id, pokemonForms.tab, moves);
    disconnect();
    response.status(200).json(forms);
  } else {
    pokemon.moves = getPokemonMoves(pokemon.moves, moves);
    disconnect();
    response.status(200).json(pokemon);
  }
});
const listNational = asyncHandler(async (request, response) => {
  const { typeOne, typeTwo, asc, desc } = request.query;
  let national = [];
  const nationalSelect = "key name.english type abilities baseStats";
  const sort = asc ? { [asc]: 1 } : desc ? { [desc]: -1 } : { _id: 1 };

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

  if (typeStatement) {
    national = await National.find()
      .or(typeStatement)
      .select(nationalSelect)
      .sort(sort);
  } else {
    national = await National.find().select(nationalSelect).sort(sort);
  }

  disconnect();
  response.status(200).json(national);
});

module.exports = {
  read: [connect, pokemonExists, getMoves, reformatPokemonBaseStats, reformatPokemonEvolution, readPokemon],
  readGame: [connect, pokemonExists, getMoves, readPokemonByGame],
  list: [connect, listNational],
};
