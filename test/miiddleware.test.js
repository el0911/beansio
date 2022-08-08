var assert = require('assert');
var beans = require('../index')
var jest  =  require('jest-mock')
beans.plantBeans('')////set up beans
describe('Test all the middleware', function () {
    
      // it('should fail to log route cuz of user isnt a string ', function () {
        
      //   const mockRequest = {
      //     method:'POST'
      //   }
      //   const mockResponse = {
      //     end: jest.fn()
      //   }
      //   const mockNext = jest.fn()
      //   const spy = jest.spyOn( beans, 'logRoute' );
      //   const userProcess =  jest.fn()
      //   userProcess.mockReturnValueOnce({})
      //   const metaDataFunct =  jest.fn()
      //   const routeLogger = beans.routeLogger(userProcess,metaDataFunct)
        
      //   routeLogger( mockRequest,mockResponse,mockNext )
      //   mockResponse.end('','')
      //   expect(spy).not.toBeCalled();///makes sure we call the logroute function

      // });

 

      it('should call logRoute ', function () {
        
        const mockRequest = {
          method:'POST'
        }
        const mockResponse = {
          end: jest.fn()
        }
        
        const spy2 = jest.spyOn( beans, 'logRoute' );
        const userProcess =  jest.fn()
        userProcess.mockReturnValueOnce('')

        // const routeLogger = beans.routeLogger(userProcess,metaDataFunct)
        beans.routerEnd(mockResponse,mockRequest,()=>{},'','')
        // routeLogger( mockRequest,mockResponse,mockNext )
        mockResponse.end('','')
        // expect(spy1).toBeCalled();///makes sure we call the logroute function
        expect(spy2).toBeCalled();///makes sure we call the logroute function
 
      });


      it('should call routerEnd ', function () {
        
        const mockRequest = {
          method:'POST'
        }
        const mockResponse = {
          end: jest.fn()
        }
        const mockNext = jest.fn()
        const spy1 = jest.spyOn( beans, 'routerEnd' );
         const userProcess =  jest.fn()
        userProcess.mockReturnValueOnce('')
        const metaDataFunct =  jest.fn()
        const routeLogger = beans.routeLogger(userProcess,metaDataFunct)
         routeLogger( mockRequest,mockResponse,mockNext )
        mockResponse.end('','')
        expect(spy1).toBeCalled();///makes sure we call the logroute function 
      });


      // it('should fail to call remixRouteLogger  ', function () {
        
      //   const mockRequest = {
      //     method:'POST'
      //   }
      //   const mockResponse = {
      //     end: jest.fn()
      //   }
      //   const mockNext = jest.fn()
      //   const spy = jest.spyOn( beans, 'logRoute' );
      //   const userProcess =  jest.fn()
      //   userProcess.mockReturnValueOnce('')
      //   const metaDataFunct =  jest.fn()
      //   const remixRouteLogger = beans.remixRouteLogger(userProcess,metaDataFunct)
        
      //   remixRouteLogger( mockRequest,mockResponse,mockNext )
      //   mockResponse.end('','')
      //   expect(spy).not.toBeCalled();///makes sure we call the logroute function
 
      // });


      // it('should log data with graphQlLogger  ', function () {
        
      //   const mockRequest = {
      //     method:'POST'
      //   }
      //   const mockResponse = {
      //     end: jest.fn()
      //   }
      //   const mockNext = jest.fn()
      //   const spy = jest.spyOn( beans, 'logRoute' );
      //   const userProcess =  jest.fn()
      //   userProcess.mockReturnValueOnce('')
      //   const metaDataFunct =  jest.fn()
      //   const graphQlLogger = beans.graphQlLogger(userProcess,metaDataFunct)
        
      //   graphQlLogger( mockRequest,mockResponse,mockNext )
      //   mockResponse.end('','')
      //   expect(spy).toBeCalled();///makes sure we call the logroute function
 
      // });

      // it('should fail to call graphQlLogger  ', function () {
        
      //   const mockRequest = {
      //     method:'POST'
      //   }
      //   const mockResponse = {
      //     end: jest.fn()
      //   }
      //   const mockNext = jest.fn()
      //   const spy = jest.spyOn( beans, 'logRoute' );
      //   const userProcess =  jest.fn()
      //   userProcess.mockReturnValueOnce({})
      //   const metaDataFunct =  jest.fn()
      //   const routeLogger = beans.routeLogger(userProcess,metaDataFunct)
        
      //   routeLogger( mockRequest,mockResponse,mockNext )
      //   mockResponse.end('','')
      //   expect(spy).not.toBeCalled();///makes sure we call the logroute function

      // });

    
  });