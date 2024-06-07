const mongo = require("mongoose")

module.exports = async () => {
await mongo.connect(process.env.MONGODB_URI)
return mongo
}
mongo.connection.on('connected', () => {
  console.log("[^] Database Connected")
})