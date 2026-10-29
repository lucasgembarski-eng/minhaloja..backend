const express = require('express');
const fs = require("fs");
const app = express();
const port = 3000;
const ARQUIVO = "./dados.json";

app.use(express.json());
app.use(express.static("public"));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

function carregar() {
    const texto = fs.readFileSync(ARQUIVO, "utf-8");
    return JSON.parse(texto);
}
function salvar(dados) {
    fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}
let { categorias, produtos } = carregar();
let proxId = produtos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
function comCategoria(p) {
    const cat = categorias.find((c) => c.id === p.categoriaid);
    return { ...p, categoria: cat ? cat.nome : "Sem categoria" };
}
app.get("/categorias", (req, res) => {
    res.status(200).json(categorias);
});

app.get("/produtos", (req, res) => {
    let lista = produtos.map(comCategoria);
    if (req.query.categoria) {
    const idCat = Number(req.query.categoria);
    lista = lista.filter((p) => !idCat || p.categoriaid === idCat);
    }
    const ordenar = req.query.ordenar;
    if (ordenar === "preco") lista.sort((a, b) => a.preco - b.preco);
    if (ordenar === "estoque")lista.sort((a, b) => a.estoque - b.estoque);
    if (ordenar === "nome") lista.sort((a, b) => a.nome.localeCompare(b.nome));

    res.status(200).json(lista);
});


app.get("/produtos/:id", (req, res) => {
    const id = Number(req.params.id);
    const produto = produtos.find((p) => p.id === id);
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
    res.status(200).json(comCategoria(produto));
});


function validar(body) {
    const nome = (body.nome || "").trim();
    const preco = Number(body.preco);
    const estoque = parseInt(body.estoque);
    const categoriaid = Number(body.categoriaid);

    if (!nome) return "Nome é obrigatório";{ erro: "informe o nome" };
    if (Number.isNaN(preco) || preco < 0) return { erro: "Preço deve ser um número maior que 0" };
    if (Number.isNaN(estoque) || estoque < 0) return { erro: "Estoque deve ser um número maior que 0" };
    if (!categorias.find((c) => c.id === categoriaid)) return { erro: "Categoria inválida" };
    return { ok: { nome, preco, estoque, categoriaid } };
}
