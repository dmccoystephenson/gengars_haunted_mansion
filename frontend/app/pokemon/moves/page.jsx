export const dynamic = 'force-dynamic';

import MovesList from "./components/MovesList";

const getMoves = async () => {
  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pokemon/moves`);
  const moves = await response.json();
  return Array.isArray(moves) ? moves : [];
}

export default async function Moves() {
  const moves = await getMoves();
  return <MovesList list={moves} />;
}
