const { connect, disconnect } = require("../connection");
const asyncHandler = require("express-async-handler");
const Abilities = require("../../../models/pokemon/abilitiesModel");
const National = require("../../../models/pokemon/nationalModel");

/* ---------- Helpers ---------- */

const normalizeAbilityKey = (name) =>
  name.replaceAll(' ', '-').replaceAll("'", '').toLowerCase();

const getPokemonThatLearnAbility = async (abilityKey) => {
  const pokedex = await National.find()
    .select(`key name.english type abilities`)
    .sort({ _id: 1 })
    .lean();
  const pokemonWithAbility = {
    normal: [],
    hidden: [],
  };

  pokedex.forEach((pokemon) => {
      const pokemonSummary = { id: pokemon._id, name: pokemon.name.english, type: pokemon.type };

      if (pokemon.abilities.one && normalizeAbilityKey(pokemon.abilities.one.name) === abilityKey) {
        pokemonWithAbility.normal.push(pokemonSummary);
      }
      if (pokemon.abilities.two && normalizeAbilityKey(pokemon.abilities.two.name) === abilityKey) {
        pokemonWithAbility.normal.push(pokemonSummary);
      }
      if (pokemon.abilities.hidden && normalizeAbilityKey(pokemon.abilities.hidden.name) === abilityKey) {
        pokemonWithAbility.hidden.push(pokemonSummary);
      }
  });
  return pokemonWithAbility;
};

/* ---------- Middleware ---------- */

const abilityExists = asyncHandler(async (request, response, next) => {
  const { id } = request.params;
  let ability = null;

  isNaN(id)
    ? (ability = await Abilities.findOne({ key: id }).lean())
    : (ability = await Abilities.findById(Number(id)).lean());

  if (!ability) {
    response.status(400);
    throw new Error("Ability not found.");
  } else {
    response.locals.ability = ability;
    next();
  }
});

/* ----------- CRUDL Ops ---------- */

const readAbility = asyncHandler(async (request, response) => {
  const { ability } = response.locals;
  ability.pokemonWithAbility = await getPokemonThatLearnAbility(ability.key);
  disconnect();
  response.status(200).json(ability);
});

const listAbilities = asyncHandler(async (request, response) => {
  const abilities = await Abilities.find()
    .select("name.english generation effect.shortEffect")
    .sort({ _id: 1 });

  disconnect();
  response.status(200).json(abilities);
});

module.exports = {
  read: [connect, abilityExists, readAbility],
  list: [connect, listAbilities],
};
