var events = require('events');

class Quee {
    constructor(method, maxAmount = 5) {
        this.tasks = []
        this.maxAmount = maxAmount
        this.runningTasks = 0
        this.method = method
        this.em = new events.EventEmitter();
        this.registerEvents()
    }


    startNewTask () {
        ///check if i can actually start a new task
        if (this.isQueeNotFull()  && this.tasks.length )  {
            this.startRun()
        }
    }

    /**
     * @description registers events 
     */
    registerEvents() {
        //Subscribe for startNewTask
        this.em.on('startNewTask', this.startNewTask.bind(this));
    }

    /**
     * @description checks if its empty
     */
    isNotEmpty() {
        return !!this.tasks.length
    }

    /**
     * @description adds to quee
     */
    add(data) {
        this.tasks.push(data)

        if ( this.isQueeNotFull()) {//not running any task
            this.startRun()
        }
    }

    /**
     * @description start running quees
     */
    startRun() {

       try {
         const data = this.tasks.pop()
         //now run data
 
         async function runMethod(resolve, reject) {
             try {
                 await this.method(data)
                 resolve({
                     status: true
                 })
             } catch (error) {
                 console.log(error)
                 reject({
                     data,
                     status: false
                 })
             }
         }
 
 
          function timeOutMethod() {
             const taskPromise = new Promise(runMethod.bind(this))
 
             function done(){
                this.runningTasks = this.runningTasks - 1
                this.em.emit('startNewTask', {});
                
             }
 
             taskPromise.then(done.bind(this))
             .catch(done.bind(this))
             
         }
 
         setTimeout(timeOutMethod.bind(this), 0)
         //increase the count of running task 
         this.runningTasks = this.runningTasks + 1;
       } catch (error) {
            console.log(error)
       }

    }


    /**
     * @description checks if quee is full
     */
    isQueeNotFull() {
        return this.maxAmount > this.runningTasks
    }

    /**
     * @description checks if any task are running 
     */
    isAnyTaskRunning() {
        return !!this.runningTasks
    }

    /**
     * @description get quee stats
     */
    getQueeStats() {

    }
}


module.exports = Quee
