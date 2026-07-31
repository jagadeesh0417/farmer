import rateLimit from 'express-rate-limit'

const common = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again in a minute.' },
}

export const storySignatureLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  limit: 20,
})

export const storyCreateLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  limit: 30,
})
