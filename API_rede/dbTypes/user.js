const mongoose = require("mongoose");

const userModel = new mongoose.Schema({
    nome: String,
    senha: String,
    turma: Number,
    cargo: String
});

module.exports = userModel;