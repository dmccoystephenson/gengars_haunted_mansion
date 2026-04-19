"use client";

import { useState } from "react";
import PokemonTableLayout from "./PokemonTableLayout";
import PokedexRow from "./PokedexRow";
import PaginationLayout from "../pagination/PaginationLayout";
import PokedexListFilters from "./PokedexListFilters";
import { nationalHeaders, pokedexHeaders } from "../variables/pokemonHeaders";

export default function PokedexList({
  list,
  pushRoute,
  national,
  game,
  search,
  searchRoute,
}) {
  const headers = national ? nationalHeaders : pokedexHeaders;
  const [recordsPerPage, setRecordsPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords =
    list.length > 0 ? list.slice(indexOfFirstRecord, indexOfLastRecord) : [];
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div id="dex-list-content" className="flex flex-col space-y-2 pb-4">
      {!search && <PokedexListFilters searchRoute={searchRoute} />}
      <PaginationLayout
        recordsPerPage={recordsPerPage}
        totalCount={list.length}
        paginate={paginate}
        currentPage={currentPage}
      >
        <PokemonTableLayout
          thead={headers.map((header, index) => (
            <th key={index} className="p-2">
              {header}
            </th>
          ))}
          tbody={currentRecords.map((pokemon) => (
            <PokedexRow
              key={pokemon._id}
              pokemon={pokemon}
              dexNo={game ? pokemon.pokedexNumber[game] : null}
              national={national}
              pushRoute={pushRoute}
            />
          ))}
        />
      </PaginationLayout>
    </div>
  );
}
