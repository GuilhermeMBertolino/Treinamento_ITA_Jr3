const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const databaseService = require("./mongoConnection.js");

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
                res.sendStatus(402);
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

app.post("/auth", async (req, res) =>
{
    let {nome, senha} = req.body;

    if(nome != undefined)
    {
        let usuario = await (await databaseService.getUsers()).find(u => u.nome === nome);

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

app.get("/usuarios", auth, async (req, res) =>
{
    let users = await databaseService.getUsers();

    res.statusCode = 200;
    res.send(users);
});

app.get("/usuario/:nome", auth, async (req, res) =>
{
    let nome = req.params.nome
    
    if(nome)
    {
        let user = await databaseService.getUser(nome);
        if(user[0])
        {
            res.statusCode = 200;
            res.send(user);
        }
        else
            res.sendStatus(404);
    }
    else
        res.sendStatus(400);
});

app.get("/tarefas", auth, async (req, res) =>
{
    let tasks = await databaseService.getTasks();

    res.statusCode = 200;
    res.send(tasks);
});

app.post("/usuario", async (req, res) =>
{
    let {nome, senha, turma, cargo} = req.body;

    if(nome && senha && turma && cargo)
    {
        await databaseService.createUser(nome, senha, turma, cargo);
        res.sendStatus(200);
    }
    else
    {
        res.sendStatus(400);
    }
});

app.post("/tarefa", async (req, res) =>
{
    let {nome, descricao, responsavel} = req.body;

    if(nome && descricao && responsavel)
    {
        await databaseService.createTask(nome, descricao, responsavel);
        res.sendStatus(200);
    }
    else
    {
        res.sendStatus(400);
    }
});

app.delete("/usuario/:nome", auth, async (req, res) =>
{
    let nome = req.params.nome;
    
    await databaseService.deleteUser(nome);
    res.sendStatus(200);
});

app.delete("/tarefa/:nome", auth, async (req, res) =>
{
    let nome = req.params.nome;

    await databaseService.deleteTask(nome);
    res.sendStatus(200);
});

app.put("/usuario/:nome", auth, async (req, res) =>
{
    let nome = req.params.nome;
    let {nNome, nSenha, nTurma, nCargo} = req.body;

    await databaseService.updateUser(nome, nNome, nSenha, nTurma, nCargo);
    res.sendStatus(200);
});

app.listen(4000, () =>
{
    console.log("API ligada!!");
});