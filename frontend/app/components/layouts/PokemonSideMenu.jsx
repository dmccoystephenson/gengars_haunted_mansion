import Link from "next/link";
import { menus } from "@/app/_constants/menus";

const SideBarIcon = ({ text, route }) => {
  return (
    <Link href={route} passHref>
      <button className="bg-purple-500 text-gray-100 py-0.5 px-3 rounded transition ease-in-out hover:translate-x-4 hover:bg-purple-100 hover:font-bold duration-300">{text}</button>
    </Link>
  );
};

export default function PokemonSideMenu() {
  return (
    <div>
      <div className={"tablet:hidden"}>
      </div>
      <div className="hidden tablet:visible tablet:flex flex-col font-mono space-y-2 p-2 text-left text-lg border bg-gray-700 m-2 rounded-xl border-purple-400">
        <SideBarIcon route={"/pokemon"} text={"Pokemon Home"} />
        {menus.map((menuItem) => (
          <div key={menuItem.title} className=" space-y-2 pb-2 border-b border-purple-100">
            <div className="bg-gray-900 text-gray-100 font-bold py-1 px-2 rounded w-fit">{menuItem.title}</div>
            <div className={"pl-4  flex flex-col space-y-1"}>
              {menuItem.list.map((page) => (
                <SideBarIcon key={page.route} route={page.route} text={page.title} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}