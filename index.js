const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const Netflix = require('./models/netflix');
const db=require('./config/config').get(process.env.NODE_ENV);
const app=express();
// app use
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});



  //create a new movie  and show information                
app.post('/api',function(req,res){
    let data =req.body;
    console.log(data);
    Netflix.findOne({'title':data.title},function(err,movieData){
      if (!movieData) {
            const netflix=new Netflix({
              "id":data.id,
              "title":data.title,
              "type":data.type,
              "description":data.description,
              "release_year":data.release_year,
              "age_certification":data.age_certification,
              "runtime":data.runtime,
              "genres":data.genres,
              "production_countries":data.production_countries,
              "imdb_score":data.imdb_score
                                     });  
            netflix.save((err,doc)=>{
                if(err) {console.log(err);
                    return res.status(400).json({ success : false});}
                res.status(200).json({
                    succes:true,
                    movieandshowInformation : doc
                });
            });
       }else{
        res.status(500).json({
        status: "Failed",
        statusCode: 500,
        message: "movie is already present",
        data: {},
      });
}})
});

//movie  update
app.patch('/api/:movie',function(req,res){
    let data =req.body;
    let title =req.params.movie;
      console.log(title);
    Netflix.findOne({'title':title},function(err,movieData){
      console.log(movieData);
        if (!movieData) {
            return res.status(404).json({
              status: "error",
              message: "Movie not found",
              statusCode: 404,
              data: {},
            });
          }
         if(movieData&&movieData.title == title){ 
            Netflix.updateOne({"title": title },data,function (err, updatedMovie) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(updatedMovie);
                    res.status(200).json({
                      status: "success",
                      statusCode: 200,
                      message: "successfully updated movie details",
                      data: {},
                    });}});
         }else{
        res.status(404).json({
        status: "Failed",
        statusCode: 404,
        message: "Movie title is not present",
        data: {},
      });
}});})


//movie delete by title 
app.delete('/api/:movie',function(req,res){
    let title =req.params.movie;
    console.log(title);
    Netflix.findOne({'title':title},function(err,movieData){
      console.log(movieData);
      if (!movieData) {
          return res.status(404).json({
            status: "error",
            message: "Movie Data not found",
            statusCode: 404,
            data: {},
          });
        }else{
            Netflix.remove({"title":title },function (err, deletedMovie) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(deletedMovie);
                    res.status(200).json({
                      status: "success",
                      statusCode: 200,
                      message: "successfully deleted Movie",
                      data: {},
                    });
                  }
                }
              );
        }
});
})


//  list of  movies  
app.get('/api',function(req,res){
            Netflix.find({},function (err, movieData) {
                  if (err) {
                    console.log(err);
                    res.status(200).json({
                      status: "Failure",
                      statusCode: 500,
                      message: "Movie and show information",
                      error:err
                    });
                    } else {
                      console.log(movieData);
                    res.status(200).json({
                      status: "success",
                      statusCode: 200,
                      message: "Movie and show information",
                      data: movieData,
                    });
                  }});
});



 // movie data based upon title 
app.get('/api/:movie',function(req,res){
  let title =req.params.movie;
  console.log(title);
  Netflix.findOne({'title':title},function(err,movieData){
      console.log(movieData);
    if (!movieData) {
        return res.status(404).json({
          status: "error",
          message: "Movie not found",
          statusCode: 404,
          data: {},
        });
      }
      else{
        console.log(movieData);
        res.status(200).json({
          status: "success",
          statusCode: 200,
          message: "Movie and show information",
          data: movieData,
        });
      }
});
})



// listening port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});