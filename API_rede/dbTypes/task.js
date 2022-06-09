const mongoose = require("mongoose");

const taskModel = new mongoose.Schema({
    nome: String,
    descricao: String,
    responsavel: Array
});

module.exports = taskModel;