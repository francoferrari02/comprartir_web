import 'reflect-metadata';

require('dotenv').config({path: __dirname + '/../.env'});

import db from './db';
import express, { Express } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as http from 'http';
import { Server } from 'http';
import passport from 'passport';
import passportJwt from 'passport-jwt';
import cors from 'cors';
import nodemailer from 'nodemailer';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerValidator from './middleware/swaggerValidator';
import { User } from './entities/user';
import { JwtPayload } from 'jsonwebtoken';
import authMiddleware from './middleware/auth';
import { replyWithError } from './http';
import {BadRequestError, NotFoundError} from './types/errors';
import { Mailer } from './services/email.service';

import apiEndpoints from './utils/endpoints';
import userRoutes from './routes/user.routes';
import categoriesRoutes from './routes/category.routes';
import productsRoutes from './routes/product.routes';
import listRoutes from "./routes/list.routes";
import listItemsRoutes from './routes/listItem.routes';
import pantriesRoutes from './routes/pantry.routes';
import pantryItemsRoutes from './routes/pantryItem.routes';
import purchasesRoutes from './routes/purchase.routes';

db.initialize()
    .then(() => {
      console.log('Database connection established!');
    })
    .catch((err) => { console.error(err) });

const app: Express = express();

// Allow front origins; use env FRONT_ORIGIN (comma separated) with default to Vite
const FRONT_ORIGINS = (process.env.FRONT_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin?: string | null): origin is string => {
  if (!origin) {
    return true; // allow non-browser clients without origin header
  }
  return FRONT_ORIGINS.includes(origin);
};

// CORS configuration - must be before routes
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Refresh-Token'],
  exposedHeaders: ['Authorization','Refresh-Token'],
  credentials: false,
}));

// CORS fallback middleware to guarantee headers on error responses
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const allowedOrigin = isAllowedOrigin(requestOrigin) && requestOrigin ? requestOrigin : FRONT_ORIGINS[0];
  if (allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Refresh-Token');
  res.header('Access-Control-Expose-Headers', 'Authorization, Refresh-Token');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    return res.sendStatus(204);
  }
  next();
});

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    replyWithError(res, new BadRequestError('Invalid JSON'))
  }
  next(err);
});

app.use(cookieParser());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.verify((error, _) => {
  if (error) {
    console.error('❌ Mailer configuration error:', error.message);
    console.error('Please check your SMTP settings in .env file');
  } else {
    console.log('✅ Mailer service up and running!');
    app.locals.mailer = new Mailer(transporter);
  }
});

const passportOptions = {
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_TOKEN
};


passport.use(new passportJwt.Strategy(passportOptions, async function (payload: JwtPayload, done: passportJwt.VerifiedCallback) {
  const user: User = await User.findOne({ where: { id: parseInt(payload.sub!) } });
  if (!user) {
    return done(null, false);
  } else {
    return done(null, user);
    }
}));

const middleware = authMiddleware(passport);


app.use(passport.initialize());

app.use(middleware);

app.use(swaggerValidator);

const specs = swaggerJsDoc(require('../docs/swagger.json'));
const docsUrl = '/docs';
app.use(docsUrl, swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

app.use(apiEndpoints.USER, userRoutes);
app.use(apiEndpoints.CATEGORIES, categoriesRoutes);
app.use(apiEndpoints.PRODUCTS, productsRoutes);
app.use(apiEndpoints.LISTS, listRoutes);
app.use(apiEndpoints.LISTS, listItemsRoutes);
app.use(apiEndpoints.PANTRIES, pantriesRoutes);
app.use(apiEndpoints.PANTRIES, pantryItemsRoutes);
app.use(apiEndpoints.PURCHASES, purchasesRoutes);

app.use((_, res) => { replyWithError(res, new NotFoundError('Route not found')) });

const httpServer: Server = http.createServer(app);
const PORT: any = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
  console.log(`Docs served on: http://localhost:${PORT}${docsUrl}`);
});
