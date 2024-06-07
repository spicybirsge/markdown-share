# Express js route handler

A simple yet convenient expressjs route handler made so it will be easy for you to start your next express backend as soon as possible.

# Features

1. MongoDB database support included with mongoose and a connector function to connect to your database. A seperate folder for writing schemas also is included.
2. Easy version handling by adding api version folder for each version.
3. folders for each type of route (create, read, update, delete) you can add more like auth for example.
4. Works with [vercel](https://vercel.com)
5. Built in errorHandler and folder for writing your middleware
6. Enables trust proxy if running in production environment so express will return the correct ip instead of the server proxy IP.
7. Beautiful request logging powered by [morgan](https://npmjs.com/package/morgan)

# Usage

1. Clone this repository
2. create .env file and add a variable called `MONGODB_URI` which should be equal to your mongoDB database URL
3. run `node index.js` and the server should start.

note: when running in production make sure to add a environment variable caled `NODE_ENV` which should be equal to `production` for better optimization

# Contribution

Got any improvements? submit a pull request.