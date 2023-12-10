// Higher Order Funcions Syntax
// const asyncFn = () =>{}
// const asyncFn = (fn) => ()=>{}
// const asyncFn = (fn) => { ()=>{} }

const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};
export { asyncHandler };

/* const asyncHandlerNew = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
}; */

/* const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
}; */

//Promise
/* const myPromise = new Promise((resolve, reject) => {});

myPromise
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });

async function promiseFn() {
  try {
    await myPromise;
  } catch (error) {
    console.log(error);
  }
} */
