

const Bull = require("bull")
const { logQueue, logQueueCustom } = require('./functs')
const url = require("url");
const fs = require('fs');
const Quee = require("./quee");


const convertToStandard = (link) => {
  const chain = link.split('/')
  let count = 1
  for (let i = 1; i < chain.length; i++) { //skip to the first link

    if (chain[i].startsWith(':')) {
      //starts with : means must be a param
      chain[i] = `$${count}`;
      count = count + 1;
    }


  }

  return chain.join('/')
}

let seed = false

const getActualRequestDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9; //  convert to nanoseconds
  const NS_TO_MS = 1e6; // convert to milliseconds
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};


class Beans {
  constructor() {
    //dont know what o do here yet
    this.registeredRoute = {}
    this.tree = {}
  }


  plantBeans(APIKey, redisUrl) {
    this.APIKey = APIKey
    this.redis = redisUrl
    this.setUpRedis()
    this.setUpJobs()
  }


  createTree = (link) => {
    const branch = {}
    const chain = link.split('/')
    let location = this.tree
    for (let i = 1; i < chain.length; i++) {
      //first check if branch exist
      if (!location[chain[i]]) {
        location[chain[i]] = {
          ____NAME____: chain[i],
          ____TYPE____: chain[i].startsWith('$') ? 'param' : 'notParam'
        }
      }
      location = location[chain[i]]
    }
    return link
  }

  remixBeans(link = "./app/routes") {



    fs.readdir(link, (err, files) => {

      files.map((filename => {
        if (!filename.includes('.tsx') && !filename.includes('.jsx') && !filename.includes('.ts') && !filename.includes('.js')) {
          /// this is a folder
          this.remixBeans(`${link}/${filename}`)
        }
        else {
          let linkFormated = `${link}/${filename.split('-'[0])}`.replace('./app/routes', '')
          linkFormated = linkFormated.replace('.tsx', '').replace('.jsx', '').replace('.ts', '').replace('.js', '')
          const allFormated = linkFormated.replace(/[$]/g, ':').replace(/[.]/g, '/')

          this.registeredRoute[this.createTree(convertToStandard(allFormated))] = {
            route: linkFormated.endsWith('/index') ? allFormated.replace('/index', '') : allFormated
          }
        }
      }))

    })
  }

  setUpJobs() {
    try {
      console.info("adding processes");
      // this.logQueue.process(1, logQueue);
      this.logQueue = new Quee(logQueueCustom)
    } catch (error) {
      console.log(error)
      throw Error("Issues adding processes to jobs  ");
    }
  }

  setUpRedis() {
    // const rtg = url.parse(this.redis);
    // const connection = redis.createClient();
    // this.logQueue = Bull('LOGGING_EVENTS', {connection}); // Specify Redis connection using object
  }

  logRoute(payload, APIKey, user) {
    
    try {
      this.logQueue.add({
        eventType: "ROUTE", payload, user, APIKey
      });
    } catch (error) {
      console.log(error)
    }
  };

  logMessage(message = "", extraData) {
    const APIKey = this.APIKey

    this.logQueue.add({
      eventType: "INFO", message, APIKey, payload: extraData
    });
  };

  logError(message, extraData) {
    const APIKey = this.APIKey

    this.logQueue.add({
      message, eventType: "ERROR", APIKey, payload: extraData
    });

  };

  hardLinkCheck(link) {
    const chain = link.split('/')
    let treePos = this.tree
    let countSeenParams = 1
    let linkConstruct = ''
    for (let i = 1; i < chain.length; i++) {
      const element = chain[i];
      if (!treePos) {
        return linkConstruct
      }
      if (treePos[element]) {

        //not a param but an exact item
        linkConstruct = `${linkConstruct}/${treePos[element].____NAME____}`
        treePos = treePos[`${element}`]

      } else if (treePos[`$${countSeenParams}`]) {
        //means that this is a param and anything goes

        linkConstruct = `${linkConstruct}/$${countSeenParams}`

        treePos = treePos[`$${countSeenParams}`]
        countSeenParams = countSeenParams + 1



      }
      else {
        //not what we looking for 
      }


    }

    return linkConstruct
  }



  beansErrorHandler(err, req, res, next) {
    //store the data
    //message and stack

    //find location

    const initial = err.stack.split('at')[1]

    seed.logError(err.message, {
      error: err.error,
      stack: err.stack,
      name: err.name,
      cause: err.cause,
      inputData: {
        body: req.body,
        query: req.query,
        params: req.params
      }
    })


    if (res.headersSent) {
      return next(err)
    }
    res.status(err.statusCode || 500).json({
      success: false,
      payload: {
        message: err.message
      },
    });


  }



  remixRouteLogger(processUser, metaDataFunct) {
    const { registeredRoute } = this
    const obj = this
    return function (req, res, next) { //middleware function
      const processUrl = req.url.split('?')[0];

      //check if processUrl is in the registerd url  or processUrl/index
      let exist = registeredRoute[processUrl] || registeredRoute[`${processUrl}/index`]

      if (exist) {
        req.rUrl = exist.route //means we found a matching URL in dictionary
      }
      else {
        //we try and find it the hard way
        const standard = obj.hardLinkCheck(processUrl)
        exist = registeredRoute[standard]
        if (exist) {
          req.rUrl = exist.route
        }

      }

      const logger = obj.routeLogger(processUser, metaDataFunct)

      logger(req, res, next)

    }
  }

  async routerEnd   (res, req , end ,chunk, encoding) {

    const { processUser, metaDataFunct } = this
    const APIKey = this.APIKey

    try {
      //make faster later
      const user = (typeof processUser === 'function' ? await processUser(req || { }) : '') || ''
      const metaData = typeof metaDataFunct === 'function' ? await metaDataFunct(req || {}) : {}
   
      
      if (typeof user !== 'string') {
        throw new Error('---------ERROR  user must be a string ---------')
      }

      // console.dir(req.baseUrl) // '/admin'
      // console.dir(req.path) // '/new'

      const method = req.method;
      const url = `${req.baseUrl}${req.rUrl || (req.route ? req.route.path : req.originalUrl)}`;
      const status = res.statusCode;
      const start = process.hrtime();
      const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
      const body = JSON.parse(JSON.stringify(req.body || {}));//CREATE OBJECT COPY
      //add options later[TODO]
      delete body.password;

      this.logRoute({
        method,
        url,
        headers: req.headers,
        status,
        data: { body, query: req.query, params: req.params },
        resposeObject: Buffer.from(chunk || '').toString(),
        metaData,
        duration: durationInMilliseconds.toLocaleString()
      }
        , APIKey, user);

      console.log('done')

      res.end = end;
      res.end(chunk, encoding);
    } catch (error) {
      console.log(error)
       console.log('---------ERROR LOGGING ON BEANS API---------')
      res.end = end;
      res.end(chunk, encoding);
    }
  }


  logAction(req, res, next) { //middleware function
    try {
    
  
      if (req.method === 'OPTIONS') {
        next();
      }
      //only call at the end of the api
       const end = res.end

      res.end =  this.routerEnd.bind(this,res,req,end)
    
    } catch (error) {
      
    }

    next();
  }



  routeLogger(processUser, metaDataFunct) {
    try {
      this.processUser = processUser
      this.metaDataFunct = metaDataFunct
      return this.logAction.bind(this);
    } catch (error) {
      
    }
  }

  formatGraphqL(req) {
    //make faster later
   try {
     const info = {}
     let query = req.body.query.trim()
 
     if (query.startsWith("query")) {
       info.type = 'query'
     } else if (query.startsWith("mutation")) {
       info.type = 'mutation'
     } else {
       //TODO MORE CHECKS
     }
 
     /**
      * query{
      *  time{ 
      *        name
      *        fame
      *   }
      * }
      */
 
     ///remove front space and the mutation/query keyword
     const formatted = query.replace(info.type, '').trim().replace(/\n/g, " ")
 
     /**
    *{
    *  time{ 
    *        name
    *        fame
    *   }
    * }
    */

      if (formatted.includes('__schema')) {
        throw Error('not a route')
      }
 
     const log = {}
     ///get the function name by  spiting with the { key 
    //  log.url = formatted.split('{')[1].trim()/// log.url =time
     const routeParamsCheck = formatted.match(/\s*(\w+)\s*\((.*)\)/)
     ///now we need to handle the case of passing variables eg me(content : $content, ego : $ego) basically when am passsiiing data
     const input = {}

     
     if (routeParamsCheck) {
      let [_,urlName,params] = routeParamsCheck
      
      const replaceDic = {}
       /*need to remove the instance of json being passed 
        * its gonna be ugly and thats okay
        *  reg ex \s*\{[^{}]+\}gm
        * replace the json text with a param like __number__ thiis would store the value for us to use later
     */

      const matches =  params.match(/\s*\{[^{}]+\}/gm)
      if (matches) {
        ///matches exist so we have to replace them with __number__
        matches.forEach((match,i)=>{
          replaceDic[`__${i}__`] = match///store the value to be used later when recreatiinig teh data
          params  = params.replace(match,`__${i}__`)
        })
      }

     
   
      
       ///this route call passes in functions
       params.split(',').forEach((param) => {
         const section = param.split(':')
         const value = `${section[1]}`.replace(/['"]+/g, '').trim();
        if (`${section[0]}`.trim() !== 'password') {
          ///dont wanna store 
          input[`${section[0]}`.trim()] =  replaceDic[`${value}`] ? replaceDic[`${value}`].replace(/ /g, '').replace(/(password):"((\\"|[^"])*)"/i,"password:*****") : value////usue value that i stored prior
        }
        
       })

      
       log.url = urlName.toLocaleLowerCase()
     }else{
      log.url = formatted.split('{')[1].trim()/// log.url =time
     }
 
 
     const tempRequest = {
      body:{},
      query:{},
      params:{}
     }
     if (info.type === 'mutation') {
       log.data = { ...tempRequest , body: {...input} }
     } else {
       log.data = { ...tempRequest , query:  {...input}}
     }

     log.url = log.url.replace(/ /g, "").replace(/{/g, "").replace(/}/g, "")
 
     return log
   } catch (error) {
     }
    /// incase error occurs
   return {
    url:'__schema',
    data:{}
   }
  }


  graphQlLogger(processUser, metaDataFunct) {
    const APIKey = this.APIKey
    const obj = this

    return function (req, res, next) { //middleware function
      const end = res.end

      //only call at the end of the api
      res.end = async function (chunk, encoding) {


        //// handle graphql

        //input data

        //// handle graphql
        try {
          const user = (typeof processUser === 'function' ? await processUser(req || {}) : '') || ''
          const metaData = typeof metaDataFunct === 'function' ? await metaDataFunct(req || {}) : {}

          if (req.method === 'OPTIONS') {
            throw new Error('---------ERROR  METHOD shouldnt be OPTIONS ---------')
          }
          const log = obj.formatGraphqL(req)
          if (typeof user !== 'string') {
            throw new Error('---------ERROR  user must be a string ---------')
          }

          if (log.url === '__schema') {
            throw new Error('---------ERROR  not what should be saved ---------')
          }
 

           const method = req.method;
          const url = log.url;
          const status = res.statusCode;
          const start = process.hrtime();
          const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
          const body = log.data.body || {}
          //add options later[TODO]
          
          obj.logRoute({
            method,
            url,
            headers: req.headers,
            status,
            data: {...log.data},
            resposeObject: Buffer.from(chunk || '').toString(),
            metaData,
            duration: durationInMilliseconds.toLocaleString()
          }
            , APIKey, user);

          res.end = end;
          res.end(chunk, encoding);
        } catch (error) {
          
          // console.log('---------ERROR LOGGING ON BEANS API---------',error)
          res.end = end;
          res.end(chunk, encoding);
        }
      }

      next();
    };

  }

}



seed = new Beans()


module.exports = seed