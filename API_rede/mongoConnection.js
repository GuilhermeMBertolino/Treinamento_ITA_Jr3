const mongoose = require("mongoose");
const userModel = require("./dbTypes/user.js");
const taskModel = require("./dbTypes/task.js");

mongoose.connect("mongodb://localhost:27017/projJRdatabase", {useNewUrlParser: true, useUnifiedTopology: true});

const User = mongoose.model("User", userModel);
const Task = mongoose.model("Task", taskModel);

class databaseService
{
    async getUsers() 
    {   
        try
        {
            return await User.find({});
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async getUser(nome)
    {
        try
        {
            return await User.find({"nome": nome})
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async getTasks()
    {
        try
        {
            return await Task.find({});
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async createUser(nome, senha, turma, cargo)
    {
        try
        {
            let newUser = new User(
            {
                nome,
                senha,
                turma,
                cargo
            });
            newUser.save();
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async createTask(nome, descricao, responsavel)
    {
        try
        {
            let newTask = new Task(
            {
                nome,
                descricao,
                responsavel
            });
            newTask.save();
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async deleteUser(nome)
    {
        try
        {
            User.deleteOne({"nome": nome});
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async deleteTask(nome)
    {
        try
        {
            Task.deleteOne({"nome": nome});
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async updateUser(nome, nNome, nSenha, nTurma, nCargo)
    {
        try
        {
            let user = await User.find({"nome": nome});
            await User.updateOne({"nome": nome}, {
                nome: nNome || user.nome,
                senha: nSenha || user.senha,
                turma: nTurma || user.turma,
                cargo: nCargo || user.cargo
            });
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

module.exports = new databaseService();