

const Bull = require("bull")
const { logQueue } = require('./functs')
const url = require("url");
const fs = require('fs')


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


 createTree = ( link ) =>{
    const branch = {}
    const chain = link.split('/')
    let location = this.tree
    for (let i = 1; i < chain.length; i++) {
      //first check if branch exist
      if (!location[chain[i]]) {
        location[chain[i]] = {
          ____NAME____:chain[i],
          ____TYPE____: chain[i].startsWith('$')  ? 'param' : 'notParam'
        }
      }
      location =  location[chain[i]] 
    }
     return  link
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
          const allFormated =  linkFormated.replace(/[$]/g, ':').replace(/[.]/g, '/')

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
      this.logQueue.process(1, logQueue);
    } catch (error) {
      console.log(error)
      throw Error("Issues adding processes to jobs  ");
    }
  }

  setUpRedis() {
    const rtg = url.parse(this.redis);
    this.logQueue = Bull('LOGGING_EVENTS', { redis: { port: parseInt(`${rtg.port}`), host: rtg.hostname, password: "randompassword" } }); // Specify Redis connection using object
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

  logError(message = "", extraData) {
    const APIKey = this.APIKey

    this.logQueue.add({
      eventType: "ERROR", message, APIKey, payload: extraData
    });

  };

  hardLinkCheck (link) {
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
      countSeenParams =  countSeenParams + 1



   } 
    else{
      //not what we looking for 
    }

    
  }

  return linkConstruct
}


  remixRouteLogger(  processUser, metaDataFunct  ) {
    const { registeredRoute } = this
    const obj = this
    return function (req, res, next)  { //middleware function
      const processUrl = req.url.split('?')[0];
 
      //check if processUrl is in the registerd url  or processUrl/index
      let exist = registeredRoute[processUrl] || registeredRoute[`${processUrl}/index`]

      if (exist) {
        req.rUrl = exist.route //means we found a matching URL in dictionary
      }
      else{
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
 



  routeLogger(processUser, metaDataFunct) {
    const APIKey = this.APIKey
    const obj = this

    return  function (req, res, next) { //middleware function
      const end = res.end
      //only call at the end of the api
      res.end = async function (chunk, encoding) {
       
        try {
          //make faster later
          const user =  (typeof processUser === 'function' ? await processUser(req || {}) : '') || ''
          const metaData = typeof metaDataFunct === 'function' ? await  metaDataFunct(req || {}) : {}

          if (typeof user !== 'string') {
            throw new Error('---------ERROR  user must be a string ---------')
          }
          const current_datetime = new Date();
          const formatted_date =
            current_datetime.getFullYear() +
            "-" +
            (current_datetime.getMonth() + 1) +
            "-" +
            current_datetime.getDate() +
            " " +
            current_datetime.getHours() +
            ":" +
            current_datetime.getMinutes() +
            ":" +
            current_datetime.getSeconds();
          const method = req.method;
          const url = req.rUrl || (req.route ? req.route.path : req.originalUrl);
          const status = res.statusCode;
          const start = process.hrtime();
          const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
          const body = JSON.parse(JSON.stringify(req.body || {}));//CREATE OBJECT COPY
         //add options later[TODO]
          delete body.password;

          obj.logRoute({
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
          
          res.end = end;
          res.end(chunk, encoding);
        } catch (error) {
          console.log(error)
          console.log('---------ERROR LOGGING ON BEANS API---------')
          res.end = end;
          res.end(chunk, encoding);
        }
      }

      next();
    };

  }

}

const seed = new Beans()


module.exports = seed