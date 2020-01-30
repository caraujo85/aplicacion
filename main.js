var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
var swig = require('swig');
var mysql = require('mysql');
const dbConfig = {
    host: 'localhost',
   user: 'caraujo',
   password: '',
   database: 'pruebas',
   port: 3306
}
var conexion = mysql.createConnection({
   host: 'localhost',
   user: 'caraujo',
   password: '',
   database: 'pruebas',
   port: 3306
});

var pool = mysql.createPool(dbConfig);
module.exports = pool;

app.get("/", function (req, res){
    var respuesta = swig.renderFile('vistas/index.html', {});
    res.send(respuesta);
})

app.get("/formulario", function (req, res){
    var respuesta = swig.renderFile('vistas/formulario.html', {});
    res.send(respuesta);
})

app.get("/usuarios/nuevo", function (req, res){
    var respuesta = swig.renderFile('vistas/usuarios/formulario.html', {});
    res.send(respuesta);
})

app.get("/producto/nuevo", function (req, res){
    var usuarios = [];
    pool.query('SELECT * FROM pruebas.usuarios', (error, results) => {
        if (error){
            throw error;
        } else{            
            results.forEach(result => {                                
                usuarios.push(new Usuario(result.id, result.nombre, result.apellido, result.telefono, result.email));
            });
            var respuesta = swig.renderFile('vistas/productos/formulario.html', {        
                usuarios: usuarios
            });
            res.send(respuesta);
        }        
    });      
})

//////// Apartado de Usuario
function UsuarioNuevo (nombre, apellido, telefono, email){    
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
}

function Usuario (id, nombre, apellido, telefono, email){
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
}

app.get('/usuarios/listar', function(req, res) {    
    var usuarios = [];
    pool.query('SELECT * FROM pruebas.usuarios', (error, results) => {
        if (error){
            throw error;
        } else{            
            results.forEach(result => {                                
                usuarios.push(new Usuario(result.id, result.nombre, result.apellido, result.telefono, result.email));
            });
            var respuesta = swig.renderFile('vistas/usuarios/listar.html', {        
                usuarios: usuarios
            });
            res.send(respuesta);
        }        
    });    
});

app.post('/guardarUsuario', function (req, res) {
    var newUsuario = new UsuarioNuevo(req.body.nombre, req.body.apellido, req.body.telefono, req.body.email);
    
    pool.query('INSERT INTO usuarios SET ?', newUsuario, (error, result) => {
        if (error) throw error;
 
        res.redirect('/usuarios/listar');        
    });
});

app.get('/eliminarUsuario/:id', function (req, res) {
    const id = req.params.id;
    pool.query('DELETE FROM usuarios WHERE id = ?', id, (error, result) => {
        if (error) throw error;
 
        res.redirect('/usuarios/listar');
    });    
});

app.get('/editarUsuario/:id', function (req, res) {
    const id = req.params.id;
    pool.query('SELECT * FROM usuarios WHERE id = ?', id, (error, results) => {
        if (error){
            throw error;
        } else{
            var newUsuario = new Usuario(results[0].id, results[0].nombre, results[0].apellido, results[0].telefono, results[0].email);                               
            var respuesta = swig.renderFile('vistas/usuarios/formulario.html', {        
                usuario: newUsuario
            });
            res.send(respuesta);
        }        
    });  
});

app.post('/actualizarUsuario', function(req, res){
    const id = req.body.id; 
    pool.query('UPDATE usuarios SET ? WHERE id = ?', [req.body, id], (error, result) => {
        if (error){
            throw error;
        } else{
            res.redirect('/usuarios/listar');
        }
    });
});

//////// Apartado de Productos
function ProductoNuevo (descripcion, precio, id_usuario) {
    this.descripcion = descripcion;
    this.precio = precio;
    this.id_usuario = id_usuario;
}

function ProductoLista (id, descripcion, precio, usuario) {
    this.id = id;
    this.descripcion = descripcion;
    this.precio = precio;
    this.usuario = usuario;
}

function Producto(id, descripcion, precio, id_usuario) {
    this.id = id;
    this.descripcion = descripcion;
    this.precio = precio;
    this.id_usuario = id_usuario;
}

app.get('/productos/listar', function(req, res) {    
    var productos = [];
    pool.query("SELECT pruebas.productos.id, pruebas.productos.descripcion, \
    pruebas.productos.precio, pruebas.usuarios.nombre, pruebas.usuarios.apellido \
    FROM  pruebas.productos INNER JOIN pruebas.usuarios ON pruebas.productos.id_usuario = pruebas.usuarios.id;", (error, results) => {
        if (error){
            throw error;
        } else{            
            results.forEach(result => {  
                //console.log(result);                              
                productos.push(new ProductoLista(result.id, result.descripcion, result.precio, result.nombre + " " + result.apellido));
            });
                        
            var respuesta = swig.renderFile('vistas/productos/listar.html', {        
                productos: productos
            });
            res.send(respuesta);
        }        
    });    
});

app.post('/guardarProducto', function (req, res) {
    var newProducto = new ProductoNuevo(req.body.descripcion, req.body.precio, req.body.id_usuario);    
    pool.query('INSERT INTO productos SET ?', newProducto, (error, result) => {
        if (error) throw error;
        
        res.redirect('/productos/listar');
        //res.status(201).send(`Producto Creado con ID: ${result.insertId}`);        
    });
});

app.get('/eliminarProducto/:id', function (req, res) {
    const id = req.params.id;
    //console.log("Usuario a eliminar: ", id);

    pool.query('DELETE FROM productos WHERE id = ?', id, (error, result) => {
        if (error) throw error;
 
        res.redirect('/productos/listar');
        //res.send('User deleted.');
    });    
});

app.get('/editarProducto/:id', function (req, res) {
    const id = req.params.id;
    var usuarios = []
    usuarios = listaUsuarios();
    //console.log("Usuarios: ", usuarios);
    //console.log("--->>", listaUsuarios());
    pool.query('SELECT * FROM productos WHERE id = ?', id, (error, results) => {
        if (error){
            throw error;
        } else{
            
            var newProducto = new Producto(results[0].id, results[0].descripcion, results[0].precio, results[0].id_usuario);                               
            console.log("PRODUCTO EDITAR: ", newProducto);
            var respuesta = swig.renderFile('vistas/productos/formulario.html', {        
                producto: newProducto,
                usuarios: usuarios
            });
            res.send(respuesta);
        }        
    });  
});

app.post('/actualizarProducto', function(req, res){
    const id = req.body.id; 
    pool.query('UPDATE productos SET ? WHERE id = ?', [req.body, id], (error, result) => {
        if (error){
            throw error;
        } else{
            res.redirect('/productos/listar');
        }
    });
});

function listaUsuarios(){
    var usuarios = [];
    pool.query('SELECT * FROM pruebas.usuarios', (error, results) => {
        if (error){
            throw error;
        } else{            
            results.forEach(result => {                                
                usuarios.push(new Usuario(result.id, result.nombre, result.apellido, result.telefono, result.email));
            });                     
        }        
    });  
    return usuarios;   
}

app.listen(8091, function() { 
    console.log("Aplicacion Running in 8091...")
});

