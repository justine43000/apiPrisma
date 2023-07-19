const PrismaClient = require("@prisma/client").PrismaClient;
const express = require("express");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bodyParser = require("body-parser");

const prisma = new PrismaClient();

const app = express();
const port = 3000;

app.use(express.json());

//User
//créer un utilisateur
app.post("/user/create", async (req, res) => {
  const { name, email, login, password } = req.body;
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      login,
      password,
    },
  });
  res.json(newUser);
});

//connexion utilisateur
require("./auth/auth");

const routes = require("./routes/routes");
const secureRoute = require("./routes/secure-routes");

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", routes);

// Plug in the JWT strategy as a middleware so only verified users can access this route.
app.use("/user", passport.authenticate("jwt", { session: false }), secureRoute);

// Handle errors.
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err });
});

//CRUD livres
app.get("/livres", async (req, res) => {
  const livres = await prisma.livre.findMany({});
  res.json(livres);
});

app.delete("/livres/:id", async (req, res) => {
  const { id } = req.params;
  const livre = await prisma.livre.delete({
    where: {
      id: Number(id),
    },
  });
  res.json(livre);
});

app.patch("/livres/update/:id", async (req, res) => {
  const { id, title, descriptif, published, author, pages, stock } = req.params;
  const livreUpdate = await prisma.livre.update({
    where: {
      id: Number(id),
    },
    data: { title, descriptif, published, author, pages, stock },
  });
  res.json(livreUpdate);
});

app.post(
  "/livres/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const {
      title,
      descriptif,
      published,
      author,
      pages,
      stock,
      userId,
      category,
      tags,
    } = req.body;
    const newlivre = await prisma.livre.create({
      data: {
        title,
        descriptif,
        published,
        author,
        pages,
        stock,
        userId,
        id_category: {
          connectOrCreate: {
            where: {
              name: category.name,
            },
            create: {
              name: category.name,
            },
          },
        },
        id_tags: {
          connectOrCreate: {
            where: { name: tags.name },
            create: {
              name: tags.name,
            },
          },
        },
      },
    });
    res.json(newlivre);
  }
);

// app.get("/user", async (req, res) => {
//   const user = await prisma.user.findMany({});
//   res.json(user);
// });

// app.get("/:id?livres", async (req, res) => {
//   const livresByUser = await prisma.user.findUnique({ where: { id } }).livre();
//   res.json(livresByUser);
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
