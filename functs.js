const axios = require('axios')
const moment = require('moment')
/**
 * @description logs an operation 
 * @param job
 * @param done
 */
 const logQueue = async (job, done) => {
  ///logs event  
  console.log("---------logging event---------");

  try {

    const url = 'https://beans-try.herokuapp.com/logger/v1/'
    const { eventType, payload = {}, user, APIKey, message } = job.data;
    const timeNow = moment.now();
    payload.platform = 'node'
    const data = { logType: eventType, logInfo: payload || {}, logMessage: message, timeNow, user, apiKey: `key ${APIKey}` }


    if (data.logInfo.method === 'GET') {
      //MAKE RESPONSE OBJECT EMPTY
      data.logInfo.resposeObject = ''
    }

    try {

      if (fetch) {
        //checks for fetch api cuz of mad frameworks like REMIX 
        const response = await fetch(url, {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, *cors, same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        if (!response.ok) {
          throw Error(response.statusText);
        }
        else {
          console.log("---------logged event---------");
          done()
          return
        }
      }

    } catch (error) {
      ///fetch not working
    }

    axios.post(url, data).then(() => {
      console.log("---------logged event---------");
      done();
    }).catch((error) => {
      console.log(error, "--------- Error occured while storing logs ---------");
      done();
    });

  } catch (error) {
    done();
  }

};



/**
 * @description logs an operation 
 * @param job
 * @param done
 */
 const logQueueCustom = async ({ eventType, payload = {}, user, APIKey, message }) => {
  ///logs event  
  console.dir("---------logging event---------",payload);

  try {

    const url = 'https://beans-try.herokuapp.com/logger/v1/'
     const timeNow = moment.now();
    payload.platform = 'node'
    const data = { logType: eventType, logInfo: payload || {}, logMessage: message, timeNow, user, apiKey: `key ${APIKey}` }


    if (data.logInfo.method === 'GET') {
      //MAKE RESPONSE OBJECT EMPTY
      data.logInfo.resposeObject = ''
    }

    try {
      const fetchCheck =  {
        fetch : fetch
      }
      if (fetchCheck.fetch) {
        console.log('uses fetch')
        //checks for fetch api cuz of mad frameworks like REMIX 
        const response = await fetch(url, {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, *cors, same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: 'follow', // manual, *follow, error
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        if (!response.ok) {
          throw Error(response.statusText);
        }
        else {
          console.log("---------logged event---------");
          return
        }
      }

    } catch (error) {
    
      ///fetch not working
    }

    axios.post(url, data).then(() => {
      console.log("---------logged event---------");
      
    }).catch((error) => {
      console.log(error, "--------- Error occured while storing logs ---------");
       
    });

  } catch (error) {
    
  }

};

module.exports = {
  logQueue,
  logQueueCustom
}
