import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import pg from "pg";
import bcrypt from "bcryptjs";
import ConnectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PgSession = ConnectPgSimple(session);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "http_sessions",
      createTableIfMissing: false,
    }),
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email.toLowerCase().trim()]
      );
      if (rows.length === 0) {
        return done(null, false, { message: "Email ou senha incorretos" });
      }
      const user = rows[0];
      if (!user.password_hash) {
        return done(null, false, { message: "Email ou senha incorretos" });
      }
      const valid = bcrypt.compareSync(password, user.password_hash);
      if (!valid) {
        return done(null, false, { message: "Email ou senha incorretos" });
      }
      if (user.status === "pending") {
        return done(null, false, { message: "Conta pendente de aprovação" });
      }
      if (user.status === "rejected") {
        return done(null, false, { message: "Conta rejeitada pelo administrador" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, rows[0] ?? null);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// ── Auth Routes ───────────────────────────────────────────────────────────────

app.post("/api/auth/login", (req, res, next) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Email ou senha incorretos" });
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      const { password_hash, ...safeUser } = user;
      return res.json({ user: safeUser });
    });
  })(req, res, next);
});

app.post("/api/auth/logout", (req, res) => {
  req.logout(() => res.json({ ok: true }));
});

app.get("/api/auth/me", (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const { password_hash, ...safeUser } = req.user as any;
  return res.json({ user: safeUser });
});

// ── Serve Vite build in production ───────────────────────────────────────────

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[PROJETOHUBDUB] Server running on port ${PORT}`);
});
