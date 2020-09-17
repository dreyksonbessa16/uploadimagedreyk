const aws = require('aws-sdk');
const mysql = require('../configs/mysql').pool;

const s3 = new aws.S3();

exports.getImagesControllers = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {return res.status(500).send({ error: error })}
        conn.query(
            `select images.url_image, images.original_name, images.name_image, users.nome, users.email
            from images
            inner join users
            on images.users_id = users.id
            where images.users_id = ?;`,
            [req.usuario.id_usuario],
            (error, result) => {
                if (error) {return res.status(500).send({ err: error })}
                conn.release();
                return res.status(200).send({
                    quantidade: result.length,
                    resultado: result
                });
            }
        )
    });
};

exports.postImagesControllers = (req, res) => {
    console.log(req.file);
    console.log(req.usuario);

    const { originalname: name, key, location: url = "" } = req.file;

    mysql.getConnection((error, conn) => {
        if (error) {return res.status(500).send({ error: error })}
        conn.query(
            `insert into images (name_image, original_name, url_image, users_id) values (?, ?, ?, ?);`,
            [key, name, url, req.usuario.id_usuario],
            (error, result) => {
                if (error) {return res.status(500).send({ err: error })}
                conn.release();
                return res.status(200).send({
                    mensagem: 'Upload com sucesso.',
                    url: url, 
                    key :key
                });
            }
        )
    });
};

exports.getImageViewControllers = (req, res, next) => {
    console.log(req.params.id);

    mysql.getConnection((error, conn) => {
        if (error) {return res.status(500).send({ error: error })}
        conn.query(
            `select url_image from images where name_image= ? && users_id = ?;`,
            [req.params.id, req.usuario.id_usuario],
            (error, result) => {
                if (error) {return res.status(500).send({ err: error })}
                conn.release();
                if(result.length !== 0){
                    return res.status(200).send({
                        mensagem: 'Imagem carregada do banco.',
                        url: result[0].url_image, 
                    });
                }else return res.status(400).send({ resultado: "Imagem não existe"})
            }
        )
    });
};

exports.deleteImagesControllers = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {return res.status(500).send({ error: error })}
        conn.query(
            `delete from images where name_image = ?;`,
            [req.params.id],
            (error, result) => {
                if (error) {return res.status(500).send({ err: error })}
                conn.release();
                if(process.env.STORAGE_TYPE === 's3'){
                    s3.deleteObject({
                        Bucket: process.env.BUCKET_NAME,
                        Key: req.params.id
                    }).promise()
                }
                return res.status(200).send({
                    mensagem: 'Deletado com sucesso!',
                    id: req.params.id
                });
            }
        )
    });
};