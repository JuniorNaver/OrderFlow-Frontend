import { NavLink } from "react-router-dom";
import stockMenus from "../../../components/menus/stockMenus";
import { usePRTestStoreContext } from "../common/PRStoreTest/PRTestUseStoreContent";


export default function Sidebar() {
  const { storeId } = usePRTestStoreContext(); // 전역 storeId

  return (
    <nav>
      {stockMenus.map((group) => (
        <div key={group.label}>
          <div>{group.label}</div>
          <ul>
            {group.children?.map((item) => {
              const to =
                typeof item.path === "function"
                  ? storeId
                    ? item.path(storeId)
                    : "#"
                  : item.path;
              const disabled = typeof item.path === "function" && !storeId;

              return (
                <li key={item.label}>
                  <NavLink
                    to={to}
                    onClick={(e) => {
                      if (disabled) {
                        e.preventDefault();
                        // toast.warn("점포를 먼저 선택해 주세요.");
                      }
                    }}
                    className={disabled ? "pointer-events-none opacity-50" : ""}
                  >
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}