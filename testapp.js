const express = require('express')
const app = express()
const port = 3000

const  beans = require('./index') 

beans.plantBeans('cb4219e6bbdbc8ca630d', 'redis://localhost:6379')


app.use(beans.routeLogger(  (req )=>{
    //this function sets user identifiers that can be stored on the db
   
  
    if ( !req.user) {
        return ""; //must be a string
    }
  
     return req.user.email || ""; ///optional customise return messages
  } ,(req)=>{
     //this function lets users set custom meta data to be stored
     return  {}; //set meta data
  }))
  

app.get('/hello', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})