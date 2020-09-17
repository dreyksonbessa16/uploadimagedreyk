const mysql = require('../configs/mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

exports.postCadastroUsers = (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) {return res.status(500).send({ error: error })}
        conn.query(
            "SELECT * FROM users WHERE email = ?",
            [req.body.email],
            (error, results) => {
              if (error) {return res.status(500).send({ error: error })}
              if (results.length > 0) {res.status(409).send({ mensagem: "Usuário já cadastrado" })} 
              else {
                bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                  if (errBcrypt) {return res.status(500).send({ error: errBcrypt })}
                  conn.query(
                    "insert into users (nome, email, senha) values ( ?, ?, ?);",
                    [req.body.nome, req.body.email, hash],
                    (error, results) => {
                      conn.release();
                      if (error) {return res.status(500).send({ error: error })}
                      const response = {
                        mensagem: "Usuário criado com sucesso",
                        usuarioCriado: {
                          id_usuario: results.insertId,
                          email: req.body.email, 
                          nome: req.body.nome
                        },
                      };
                      return res.status(200).send(response);
                    }
                  );
                });
              }
            }
          );
    });
};

exports.postLoginUsers = (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) {return res.status(500).send({ error: error })}
        const query = `SELECT * FROM users WHERE email = ?;`;
        conn.query(query, [req.body.email], (error, results, fields) => {
          conn.release();
          if (error) {return res.status(500).send({ error: error })}
          if (results.length < 1) {return res.status(401).send({ mensagem: "Falha na autenticação" })}
          bcrypt.compare(req.body.senha, results[0].senha, function (err, result) {
            if (err) {return res.status(401).send({ mensagem: "Falha na autenticação" })}
            if (result) {
              const token = jwt.sign(
                {
                  id_usuario: results[0].id,
                  email: results[0].email,
                },
                process.env.JWT_KEY,
                {
                  expiresIn: "1d",
                }
              );
              return res.status(200).send({mensagem: "Usuário Autenticado", token: token});
            }
            return res.status(401).send({ mensagem: "Falha na autenticação" });
          });
        });
      });
};