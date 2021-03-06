import 'dotenv/config'

import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import nunjucks from 'nunjucks'
import requestId from 'express-request-id'
import rateLimit from 'express-rate-limit'
import routes from './routes'
import swaggerDocument from '../swagger.json'
import swaggerUi from 'swagger-ui-express'
import utils from './utils'
import models, { sequelize } from './models'

const app = express()
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }'
}
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
})

nunjucks.configure('mail_templates', { autoescape: true })
const logLevel = (process.env.NODE_ENV === 'production') ? 'common' : 'dev'

// Third-party middleware
app.use(requestId())
app.use(morgan(logLevel))
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV === 'production') app.use(apiLimiter)

// Custom middleware
app.use(async (req, res, next) => {
  req.context = {
    models,
    // e: await utils.loadCasbin()
  }

  next()
})

// Helper endpoints
app.get('/', (req, res) => {
  res.redirect('/api-docs')
})
app.get('/help', (req, res) => {
  res.redirect('/api-docs')
})
app.use('/api-docs', apiLimiter, swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions))
app.use('/health', (req, res) => {
  res.status(200).json({
    uptime: utils.formatTime(process.uptime()),
    environment: process.env.NODE_ENV || 'n/a',
    version: process.env.npm_package_version || 'n/a',
    requestId: req.id
  })
})

// Routes
Object.entries(routes).forEach(([key, value]) => {
  app.use(`/${key}`, value)
})

// Handle 404
app.use((req, res) => {
  return res.status(404).send('Not Found')
})

// Handle 503
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error)
  return res.status(503).send('Service Unavailable')
})

// Starting Express and connecting to PostgreSQL
try {
  sequelize.sync().then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Bmore Responsive is available at http://localhost:${process.env.PORT || 3000}`)
    })
  })
} catch (e) {
  console.error(e)
}

export default app
