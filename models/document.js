var mongoose=require('mongoose');
var Schema = mongoose.Schema;

const confiq=require('../config/config').get(process.env.NODE_ENV);

const documentSchema=mongoose.Schema({
    name:{
        type: String,
        required: true,
        maxlength: 100
    },
    price:{
        type: Number,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    created_by:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
});

module.exports=mongoose.model('Document',documentSchema);