import { Children } from "react";

export default Chip({ active, onclick, Children}) {
    return(
        <button
        onclick={onclick}
        className={`px-3 py-1 rounded-full text-sm border ${
        active ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {Children}
      </button>
    );
}