import express from "express";
import mysql from "mysql";
import cors from "cors";
import multer from "multer";



const app = express(); 
app.use(cors());
const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static('uploads'));


// Ruta para agregar un nuevo producto
app.post("/productos", upload.single('imagen'), (req, res) => {
  const q = "INSERT INTO productos(`titulo`, `descripcion`, `precio`, `imagen`) VALUES (?)";

  const values = [
    req.body.titulo,
    req.body.descripcion,
    req.body.precio,
    req.file.path,
  ];

  pool.query(q, [values], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
});


app.use(express.json());

// Creación de la conexión de la base de datos
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});

app.get("/", (req, res) => {
  res.json("hello");
});


// Ruta para obtener todos los productos
app.get("/productos", (req, res) => {
  const q = "SELECT * FROM productos";
  pool.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    return res.json(data);
  });
});


// Ruta para eliminar un producto existente
app.delete("/productos/:id", (req, res) => {
  const productoId = req.params.id;
  const q = " DELETE FROM productos WHERE id = ? ";

  pool.query(q, [productoId], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
});




// Ruta para actualizar un producto existente
app.put("/productos/:id", upload.single('imagen'), async (req, res) => {
  const id = req.params.id;
  const { titulo, descripcion, precio } = req.body;

  // Obtén el producto actual de la base de datos
  pool.query("SELECT * FROM productos WHERE id = ?", id, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }

    if (results.length === 0) {
      res.status(404).send("No se encontró ningún producto con ese id");
      return;
    }

    const productoActual = results[0];

    // Si no se proporciona un nuevo valor, usa el valor actual
    const productoNuevo = {
      titulo: titulo || productoActual.titulo,
      descripcion: descripcion || productoActual.descripcion,
      precio: precio || productoActual.precio,
      imagen: req.file ? 'uploads/' + req.file.filename : productoActual.imagen,
    };

    // Actualiza el producto en la base de datos
    pool.query(
      "UPDATE productos SET ? WHERE id = ?", [productoNuevo, id],
      (err, result) => {
        if (err) console.log(err);
        else res.send(result);
      }
    );
  });
});




app.listen(8800, () => {
  console.log("Connected to backend.");
});
