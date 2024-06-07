if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');
require('./database/connector')();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('combined'));
app.use(cors());
app.use(errorHandler);
app.set('json spaces', 1)
if(process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true); 
}


app.use('/api/v1/create', require('./routes/v1/create'));
app.use('/api/v1/delete', require('./routes/v1/delete'));
app.use('/api/v1/read', require('./routes/v1/read'));
app.use('/api/v1/update', require('./routes/v1/update'));

app.get('/status', async (req, res) => {
    res.status(200).json({success: true, message: "All systems operational.", code: 200})
})

app.all('*', async (req, res) => {
    
    res.status(404).json({success: false, message: "No matching route found.", code: 404})

})


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`[^] Server is running on port ${PORT} in ${process.env.NODE_ENV || "developement"} mode`);
})