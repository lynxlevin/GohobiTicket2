# How to test in development
npm start

# How to test Web Push in development
1. Copy VITE_VAPID_PUBLIC_KEY from `.env.development` and paste to `.env.production`
   1. **Do not lose the actual production VAPID_PUBLIC_KEY"**
1. `npm run production_local`
This can be tested on Safari

# How to build for production
npm run build