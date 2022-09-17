var mongoose=require('mongoose');
var Schema = mongoose.Schema;
const confiq=require('../config/config').get(process.env.NODE_ENV);
const netflixSchema=mongoose.Schema({
    id:{
        type: String,
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    type:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },release_year:{
        type: String,
        required: true,
    },
    runtime:{
        type: String,
        required: true,
    },
    genres:{
        type: String,
        required: true,
    },
    production_countries:{
        type: String,
        required: true,
    },
    imdb_score:{
        type: String,
        required: true,
    }
});

module.exports=mongoose.model('netflix',netflixSchema);






