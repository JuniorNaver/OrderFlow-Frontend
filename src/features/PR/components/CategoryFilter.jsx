/**
 * @param {{ categories:{id:string,name:string}[], value?:string, onChange:(id:string)=>void }} props
 */
export default function CategoryFilter({ categories=[], value="", onChange=()=>{} }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      <button
        className={`px-3 py-1 rounded-xl border ${!value ? "font-semibold" : ""}`}
        onClick={()=>onChange("")}
      >전체</button>
      {categories.map(c => (
        <button
          key={c.id}
          className={`px-3 py-1 rounded-xl border ${value===c.id ? "font-semibold" : ""}`}
          onClick={()=>onChange(c.id)}
        >{c.name}</button>
      ))}
    </div>
  );
}
