import Cookies from "js-cookie";

export function Navbar() {
  
  const hanldeLogout = () => {
    Cookies.remove('username')
    Cookies.remove('id')
  }

  return (
    <nav className="bg-zinc-700 my-3 flex justify-between py-5 px-10 rounded-lg col-span-3">
      <h1 className="text-xl font-bold">Pagina principal</h1>
        <div>
            <a href="/" className="text-white" onClick={hanldeLogout}>Salir</a>
            
        </div>
    </nav>
  );
}
