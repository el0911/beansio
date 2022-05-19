# Beans (😏)

Logger for logging system events for [Beansio](https://beansio.app/)


## How to use beans to log middleware events 


### Remix.js Route logger Example


```JS
///init beans in the server.tsx file
beans.plantBeans('Api-key','redis://localhost:6379')
//init special remix functions
beansTree.remixBeans()

//set up sessions
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || ''],
    secure: process.env.NODE_ENV === "production",
  },
});

//add middleware for remix
app.use(
    beansTree.remixRouteLogger(

        async (req: any) => {
            const USER_SESSION_KEY = "userId";

            //this function sets user identifiers that can be stored on the db
            const cookie = req.headers['cookie']
            const session = await sessionStorage.getSession(cookie)
            const user =  session.get(USER_SESSION_KEY)

            return  user; ///optional customise return messages
        }
        , async (req: any) => {
            //this function lets users set custom meta data to be stored
            return {}; //set meta data
        }
    )
)   
```

### Express Example
```JS
const express = require('express')
const app = express()
const port = 3100
//import beans library
const beans = require('./index')

//initialise beans
beans.plantBeans('Api-key','redis://localhost:6379')

//Calling the ExpressBeans function to log all 
app.use(beansTree.routeLogger(  (req )=>{
  //this function sets user identifiers that can be stored on the db
 

  if ( !req.user) {
      return ""; //must be a string
  }

   return req.user.email || ""; ///optional customise return messages
} ,(req)=>{
   //this function lets users set custom meta data to be stored
   return  {}; //set meta data
}))




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

```

## How to use beans to log Custom messages

```JS
    const event = () =>{
        ///perfom operation
        beans.logMessage('Event triggered by user ',{})
    }
```

## How to use beans to log an error event

```JS
    const startJokeServer =   () =>{
        app.listen(port, () => {
           //////
        }).on('error', (error) => {
            beans.logError('Error starting server',{})
        });
    }
```

 # beansio
