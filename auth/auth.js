const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();

// ...

passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "login",
      passwordField: "password",
    },
    async (login, password, done) => {
      try {
        const user = await prisma.user.create({
          data: {
            login,
            password,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ...

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "login",
      passwordField: "password",
    },
    async (login, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: {
            login,
          },
        });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const validate = await user.password;

        if (validate !== password) {
          return done(null, false, { message: "Wrong Password" });
        }

        return done(null, user, { message: "Logged in Successfully" });
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

passport.use(
  new JWTstrategy(
    {
      secretOrKey: "TOP_SECRET",
      jwtFromRequest: ExtractJWT.fromUrlQueryParameter("secret_token"),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);
