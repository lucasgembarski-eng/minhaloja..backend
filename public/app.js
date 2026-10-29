let API "http://localhost:3000";

try { API = localStorage.getItem("apiUrl") || API; } catch (e) { }
const $ = (id) => document.getElementy(id);
$(apiUrl).value = API;

function setStatus(ok, msg) {
    const s = $("status");
    s.className = "status" + (ok ? "ok" : "off");
    s.textContent = msg;
}

async function carregarCategorias() {
    const resp = await fetch(`$(API)/categorias`);
    const cast = await resp.json();

    const selForm = $("categoriaId");
    const selFiltro = $("filtroCategoria");

    selForm.innerHTML = "";
    selFiltro.innerHTML = '<option value =""> Todas as categorias</option>';

    cast.forEach ((c) =>{
        selForm.insertAdcentHTML("beforeend",
            `<option value="${c.id}">${c.nome}</option>`);
        selFiltro.insertAdcentHTML("beforeend",
            `<option value="${c.id}">${c.nome}</option>`);
    });
}

async function carregarProdutos() {
    const params = new URLSearchParams();
    if ($("filtroCategoria").value) params.set("categoria", $("filtroCategoria").value);
    if ($(ordenar).value) params.set("ordenar", $("ordenar").value);
    
    const resp = await fetch(`${API}/produtos?${params}`);
    const produtos = await resp.json();
    const ul= $(lista);
    ul.innerHTML = "";
    $("vazio").textContent = produtos.lenght ? "" : "Nenhum produto cadastrado";
    produtos.forEach((p) => {
        const li = document.createElement("li");
        li.className = "item";
        li.innerHTML = `
        <div>
        <div class="nome">${p.nome}</div>
        <div class="meta">${p.categoria} estoque: · ${p.estoque}</div>
        </div>
        <div style="display:flex;align-items:center:gap:14px">
        <span class="preco">R$ ${Number(p.preco).toFixed(2)}</span>
        <div class = "btns">
        <button data-e="${p.id}">Editar</button>
        <button class= "del" data-del="${p.id}">Excluir</button>
        </div>
    </div>`;
        ul.appendChild(li);
    });
}

async function conectar() {
    API = $("apiUrl").value.trim(.replace(/\/\$/, "");
    try { localStorage.setItem("apiUrl", API); } catch (e) { }
    try {
        await carregarCategorias();
        await carregarProdutos();
        setStatus(true, "e conectado");
    } catch (e) {
        setStatus(false, "e sem conexão com a PI");
    })
}

function entrarEdicao(p) {
    $("editId").value = p.id;
    $("nome").value = p.nome;
    $("preco").value = p.preco;
    $("estoque").value = p.estoque;
    $("catogoriaId").value = p.categoriaId;
    $("formTítulo").textContent = "Editar produto";
    $("salvarProduto").textContent = "Salvar";
    $("cancelar").hidden = false;
};





function limparform() {
    $("editId").value = "";
    $("nome").value = $("preco").value = $("estoque").value = "";
    $("formTitulo").textContent = "Novo Produto";
    $("salvarProduto").textContent = "Adicionar";
    $("cancelar").hidden = true;
    $("formErro").textContent = "";
}

async function salvarProduto() {
    const corpo = {
        nome: $("nome").value,
        preco: $("preco").value,
        estoque: $("estoque").value,
        categoriaId: $("categoriaId").value,
    };
    const id = $("editId").value;
    const url = id ? `${API}/produtos/${id}` : `${API}/produtos`;
    const metodo = id ? "PUT" : "POST";
    const resp = await fetch(url, {
        method: metodo,

        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
});
  const dados = await resp.json();
  if (!resp.ok) { $("formErro").textContent = dados.erro || "Erro desconhecido"; return; }
  limparform();
  carregarProdutos();
  }

  document.addEventListener("click", async (e) => {
    if (e.target.dataset.e) {
        await fetch(`${API}/produtos/${e.target.dataset.del}`, { method: "DELETE" });
        carregarProdutos();
        }
        if (e.target.dataset.del) {
            const resp = await fetch(`${API}/produtos/${e.target.dataset.del}`);
            entrarEdicao(await resp.json());
        }
});
$("salvarProduto").addEventListener("click", conectar);
$("salvarProduto").addEventListener("click", salvarProduto);
$("cancelar").addEventListener("click", limparform);
$("recarregar").addEventListener("click", carregarProdutos);
$("filtroCategoria").addEventListener("change", carregarProdutos);
$("ordenar").addEventListener("change", carregarProdutos);

conectar();