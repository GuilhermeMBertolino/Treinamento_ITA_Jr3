const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const JWTpassword = "borarede";

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const auth = (req, res, next) =>
{
    const authToken = req.headers.authorization;
    
    if(authToken != undefined)
    {
        const token = authToken.split(" ")[1];

        jwt.verify(token, JWTpassword, (err, data) =>
        {
            if(err)
                res.sendStatus(401);
            else
            {
                req.token = token;
                req.loggedUser = {id: data.id, nome: data.nome, turma: data.turma, cargo: data.cargo};
                next();
            }
        });
    }
    else
        res.sendStatus(401);
}

let DB = JSON.parse(fs.readFileSync("Banco.json"));

app.post("/auth", auth, (req, res) =>
{
    let {nome, senha} = req.body;

    if(nome != undefined)
    {
        let usuario = DB.usuarios.find(u => u.nome == nome);

        if(usuario != undefined)
        {
            if(usuario.senha === senha)
            {
                jwt.sign({
                            id: usuario.id, 
                            nome: usuario.nome,
                            turma: usuario.turma,
                            cargo: usuario.cargo
                        }, JWTpassword, {expiresIn: "24h"}, (err, token) => {
                    if(err)
                    {
                        res.statusCode = 400;
                        res.json({err: "Falha interna"});
                    }
                    else
                    {
                        res.statusCode = 200;
                        res.json({token: token});
                    }
                });
            }
            else
                res.sendStatus(401);
        }
        else
            res.sendStatus(404);
    }
    else
        res.sendStatus(400);
});

app.get("/usuarios", auth, (req, res) =>
{
    res.statusCode = 200;
    res.json(DB.usuarios);
});

app.get("/usuario/:id", auth, (req, res) =>
{
    if(isNaN(req.params.id))
    {
        res.sendStatus(400);
    }
    else
    {
        let id = parseInt(req.params.id);
        let usuario = DB.usuarios.find(u => u.id === id);
        if(usuario !== undefined)
        {
            res.statusCode = 200;
            res.json(usuario);
        }
        else
        {
            res.sendStatus(404);
        }
    }
});

app.get("/tarefas", auth, (req, res) =>
{
    res.statusCode = 200;
    res.send(DB.tarefas);
});

app.get("/tarefa/:id", auth, (req, res) =>
{
    if(isNaN(req.params.id))
    {
        res.sendStatus(400); 
    }
    else
    {
        let id = parseInt(req.params.id);
        let tarefa = DB.tarefas.find(u => u.id === id);
        if(tarefa !== undefined)
        {
            res.statusCode = 200;
            res.json(tarefa);
        }
        else
        {
            res.sendStatus(404);
        }
    }
});

app.post("/usuario", auth, (req, res) =>
{
    let {id, nome, senha, turma, cargo} = req.body;

    if(id && nome && senha && turma && cargo)
    {
        DB.usuarios.push({
            id,
            nome,
            senha,
            turma,
            cargo
        });
        res.sendStatus(200);
    }
    else
    {
        res.sendStatus(400);
    }
});

app.post("/tarefa", auth, (req, res) =>
{
    let {id, descricao, responsavel} = req.body;

    if(id && descricao && responsavel)
    {
        DB.tarefas.push(
        {
            id,
            descricao,
            responsavel
        });
        res.sendStatus(200);
    }
    else
    {
        res.sendStatus(400);
    }
});

app.delete("/usuario/:id", auth, (req, res) =>
{
    if(isNaN(req.params.id))
    {
        res.sendStatus(400);
    }
    else
    {
        let id = parseInt(req.params.id);
        let usuario = DB.usuarios.findIndex(u => u.id === id);
        if(usuario !== -1)
        {
            DB.usuarios.splice(usuario, 1);
            res.sendStatus(200);
        }
        else
        {
            res.sendStatus(404);
        }
    }
});

app.delete("/tarefa/:id", auth, (req, res) =>
{
    if(isNaN(req.params.id))
    {
        res.sendStatus(400);
    }
    else
    {
        let id = parseInt(req.params.id);
        let tarefa = DB.tarefas.findIndex(u => u.id === id);
        if(tarefa !== -1)
        {
            DB.tarefas.splice(tarefa, 1);
            res.sendStatus(200);
        }
        else
        {
            res.sendStatus(404);
        }
    }
});

app.put("/usuario/:id", auth, (req, res) =>
{
    if(isNaN(req.params.id))
    {
        res.sendStatus(400);
    }
    else
    {
        let id = parseInt(req.params.id);
        let usuario = DB.usuarios.find(u => u.id === id);
        if(usuario !== undefined)
        {
            let {nome, senha, turma, cargo} = req.body;

            usuario.nome = nome || usuario.nome;
            usuario.senha = senha || usuario.senha;
            usuario.turma = turma || usuario.turma;
            usuario.cargo = cargo || usuario.cargo;
            res.sendStatus(200);
        }
        else
        {
            res.sendStatus(404);
        }
    }
});

app.put("/tarefa/:id", auth, (req, res) =>
{
    if(isNaN(req.params.id))
    {
        res.sendStatus(400);
    }
    else
    {
        let id = parseInt(req.params.id);
        let tarefa = DB.tarefas.find(u => u.id === id);
        if(tarefa !== undefined)
        {
            let {descricao, responsavel} = req.body;

            tarefa.descricao = descricao || tarefa.descricao;
            tarefa.responsavel = responsavel || tarefa.responsavel;
            res.sendStatus(200);
        }
        else
        {
            res.sendStatus(404);
        }
    }
});

app.listen(4000, () =>
{
    console.log("API ligada!!");
});